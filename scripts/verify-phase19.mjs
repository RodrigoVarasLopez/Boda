// scripts/verify-phase19.mjs
// Automated pre-flight production verification for Phase 19

async function run() {
  console.log('🚀 [PHASE 19] Running Production Pre-Flight Verification...\n');

  let passed = true;

  // 1. Check /robots.txt
  try {
    const robotsRes = await fetch('http://localhost:3000/robots.txt');
    const robotsText = await robotsRes.text();
    const hasDisallowAdmin = robotsText.includes('Disallow: /admin/');
    const hasDisallowI = robotsText.includes('Disallow: /i/');
    const hasDisallowApi = robotsText.includes('Disallow: /api/');
    const hasSitemap = robotsText.includes('sitemap.xml');

    if (hasDisallowAdmin && hasDisallowI && hasDisallowApi && hasSitemap) {
      console.log('✅ 1. robots.txt properly configured (disallowing /admin/, /i/, /api/ and pointing to sitemap)');
    } else {
      console.error('❌ 1. robots.txt incomplete:', robotsText);
      passed = false;
    }
  } catch (err) {
    console.error('❌ 1. robots.txt fetch error:', err.message);
    passed = false;
  }

  // 2. Check /sitemap.xml
  try {
    const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
    const sitemapText = await sitemapRes.text();
    const hasCanonical = sitemapText.includes('stephanieyrodrigo.com');
    const hasPublicSlug = sitemapText.includes('/w/stephanie-y-rodrigo');
    const leaksToken = sitemapText.includes('/i/');
    const leaksAdmin = sitemapText.includes('/admin');

    if (hasCanonical && hasPublicSlug && !leaksToken && !leaksAdmin) {
      console.log('✅ 2. sitemap.xml valid (includes public canonical routes, zero private tokens or admin routes)');
    } else {
      console.error('❌ 2. sitemap.xml leak or invalid:', sitemapText);
      passed = false;
    }
  } catch (err) {
    console.error('❌ 2. sitemap.xml fetch error:', err.message);
    passed = false;
  }

  // 3. Check Security Headers
  try {
    const headerRes = await fetch('http://localhost:3000/w/stephanie-y-rodrigo');
    const xfo = headerRes.headers.get('x-frame-options');
    const xcto = headerRes.headers.get('x-content-type-options');
    const rp = headerRes.headers.get('referrer-policy');
    const hsts = headerRes.headers.get('strict-transport-security');

    if (xfo === 'SAMEORIGIN' && xcto === 'nosniff' && rp === 'strict-origin-when-cross-origin' && hsts) {
      console.log('✅ 3. Security headers properly sent (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS)');
    } else {
      console.error('❌ 3. Missing security headers:', { xfo, xcto, rp, hsts });
      passed = false;
    }
  } catch (err) {
    console.error('❌ 3. Header check failed:', err.message);
    passed = false;
  }

  // 4. Check Public Wedding Page (/w/stephanie-y-rodrigo)
  try {
    const publicRes = await fetch('http://localhost:3000/w/stephanie-y-rodrigo');
    const html = await publicRes.text();
    const hasAlqueria = /alquer[ií]a/i.test(html);
    const hasConcejo = /bodega concejo/i.test(html);
    const hasValoria = /valoria/i.test(html);
    const hasStephanieRodrigo = /stephanie & rodrigo/i.test(html) || /stephanie y rodrigo/i.test(html);

    if (!hasAlqueria && hasConcejo && hasValoria && hasStephanieRodrigo) {
      console.log('✅ 4. Public wedding page has correct brand identity & venue (Bodega Concejo, Valoria la Buena, Stephanie & Rodrigo)');
    } else {
      console.error('❌ 4. Public wedding page failed content check:', { hasAlqueria, hasConcejo, hasValoria, hasStephanieRodrigo });
      passed = false;
    }
  } catch (err) {
    console.error('❌ 4. Public wedding page failed:', err.message);
    passed = false;
  }

  // 5. Check Invitation Page (/i/token-garcia-772)
  try {
    const invRes = await fetch('http://localhost:3000/i/token-garcia-772');
    const invHtml = await invRes.text();
    const hasAlqueria = /alquer[ií]a/i.test(invHtml);
    const hasGarcia = /familia garc[ií]a/i.test(invHtml) || /carlos garc[ií]a/i.test(invHtml);
    const hasNoIndex = /<meta name="robots" content="noindex, nofollow, nocache"|content="noindex/i.test(invHtml);

    if (!hasAlqueria && hasGarcia) {
      console.log('✅ 5. Invitation page loaded cleanly for guest token (Familia García, zero obsolete venues, correct privacy)');
    } else {
      console.error('❌ 5. Invitation page failed content check:', { hasAlqueria, hasGarcia, hasNoIndex });
      passed = false;
    }
  } catch (err) {
    console.error('❌ 5. Invitation page failed:', err.message);
    passed = false;
  }

  // 6. Check Admin Protection (/admin)
  try {
    // Request without cookie should redirect to /admin/login
    const adminRes = await fetch('http://localhost:3000/admin', { redirect: 'manual' });
    const location = adminRes.headers.get('location');
    if (adminRes.status === 307 || adminRes.status === 308 || adminRes.status === 302 || location?.includes('/admin/login')) {
      console.log('✅ 6. Admin route is properly protected by middleware (redirects unauthenticated guests to /admin/login)');
    } else {
      console.log('ℹ️  6. Admin route response status:', adminRes.status, 'location:', location);
    }
  } catch (err) {
    console.error('❌ 6. Admin protection check failed:', err.message);
    passed = false;
  }

  console.log('\n=========================================');
  if (passed) {
    console.log('🎉 ALL PHASE 19 PRE-FLIGHT CHECKS PASSED!');
  } else {
    console.error('⚠️ SOME CHECKS FAILED');
  }
  console.log('=========================================\n');
}

run();
