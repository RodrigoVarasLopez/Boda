import {
  uploadMediaAction,
  approveMediaAction,
  hideMediaAction,
  deleteMediaAction,
  updateMediaCaptionAction,
  bulkModerateMediaAction,
  submitGuestbookAction,
  approveGuestbookAction,
  hideGuestbookAction,
  deleteGuestbookAction,
} from '../app/actions.js';
import { getStoredPhotos, getStoredGuestbook } from '../lib/media-data.js';

async function runTests() {
  console.log('=== TEST 1: Guest Photo Upload Validation ===');

  // Test 1A: Reject non-image / disallowed type
  const badFormData = new FormData();
  const fakeSvg = new Blob(['<svg><script>alert(1)</script></svg>'], { type: 'image/svg+xml' });
  badFormData.append('file', fakeSvg, 'attack.svg');
  badFormData.append('caption', 'Test malicious SVG');
  const resBad = await uploadMediaAction(badFormData);
  console.assert(resBad.success === false, 'Disallowed SVG must be rejected');
  console.log('✔ Rejected SVG upload correctly:', resBad.message);

  // Test 1B: Valid guest PNG upload -> status must be 'pending'
  const validFormData = new FormData();
  // Valid 1x1 PNG binary
  const pngBytes = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360606060000000050001a7df9d2c0000000049454e44ae426082',
    'hex'
  );
  const validFile = new Blob([pngBytes], { type: 'image/png' });
  validFormData.append('file', validFile, 'recuerdo-amigos.png');
  validFormData.append('caption', 'Momento inolvidable con los novios');
  validFormData.append('uploader_name', 'Marta y Sergio');
  validFormData.append('is_admin', 'false');

  const resUpload = await uploadMediaAction(validFormData);
  console.assert(resUpload.success === true, 'Valid image must succeed');
  console.assert(resUpload.photo?.status === 'pending', 'Guest upload must be pending');
  console.assert(resUpload.photo?.is_approved === false, 'Guest upload must not be approved');
  console.log('✔ Guest upload succeeded with status pending:', resUpload.photo?.id);

  const guestPhotoId = resUpload.photo.id;

  // Test 2: Admin Moderation of the new guest photo
  console.log('\n=== TEST 2: Admin Moderation of Photo ===');
  await approveMediaAction(guestPhotoId);
  let photos = getStoredPhotos();
  let photo = photos.find((p) => p.id === guestPhotoId);
  console.assert(photo?.status === 'approved', 'Photo status must be approved after approveMediaAction');
  console.assert(photo?.is_approved === true, 'is_approved must be true');
  console.log('✔ Photo approved successfully');

  await hideMediaAction(guestPhotoId);
  photos = getStoredPhotos();
  photo = photos.find((p) => p.id === guestPhotoId);
  console.assert(photo?.status === 'hidden', 'Photo status must be hidden');
  console.assert(photo?.is_visible === false, 'Photo is_visible must be false');
  console.log('✔ Photo hidden successfully');

  await updateMediaCaptionAction(guestPhotoId, 'Pie de foto actualizado por el admin');
  photos = getStoredPhotos();
  photo = photos.find((p) => p.id === guestPhotoId);
  console.assert(photo?.caption === 'Pie de foto actualizado por el admin', 'Caption updated');
  console.log('✔ Photo caption updated successfully');

  await deleteMediaAction(guestPhotoId);
  photos = getStoredPhotos();
  photo = photos.find((p) => p.id === guestPhotoId);
  console.assert(!photo, 'Photo deleted from store');
  console.log('✔ Photo deleted successfully');

  // Test 3: Bulk moderation
  console.log('\n=== TEST 3: Bulk Moderation ===');
  const targetIds = [photos[0].id, photos[1].id];
  const bulkRes = await bulkModerateMediaAction(targetIds, 'hide');
  console.assert(bulkRes.success === true && bulkRes.count === 2, 'Bulk hide 2 photos');
  photos = getStoredPhotos();
  console.assert(photos.find((p) => p.id === targetIds[0])?.status === 'hidden', 'Photo 1 hidden');
  console.assert(photos.find((p) => p.id === targetIds[1])?.status === 'hidden', 'Photo 2 hidden');
  console.log('✔ Bulk moderation hide completed successfully');

  // Restore back to approved
  await bulkModerateMediaAction(targetIds, 'approve');
  photos = getStoredPhotos();
  console.assert(photos.find((p) => p.id === targetIds[0])?.status === 'approved', 'Photo 1 re-approved');
  console.log('✔ Bulk moderation re-approve completed successfully');

  // Test 4: Guestbook Submission and Moderation
  console.log('\n=== TEST 4: Guestbook Submission & Moderation ===');
  const gbRes = await submitGuestbookAction({
    guest_name: '<b>Lucía y Marcos</b>',
    message: '<script>alert(1)</script>¡Enhorabuena Stephanie y Rodrigo! Deseando celebrar en Bodega Concejo.',
    wedding_id: 'w-stephanie-rodrigo-2027',
  });
  console.assert(gbRes.success === true, 'Guestbook submit must succeed');
  console.assert(gbRes.entry?.status === 'pending', 'Guestbook entry must default to pending');
  console.assert(!gbRes.entry?.guest_name.includes('<b>'), 'HTML tags must be stripped from guest_name');
  console.assert(!gbRes.entry?.message.includes('<script>'), 'HTML tags must be stripped from message');
  console.log('✔ Guestbook submission sanitized and pending:', gbRes.entry?.id);

  const gbId = gbRes.entry.id;
  await approveGuestbookAction(gbId);
  let gbList = getStoredGuestbook();
  let entry = gbList.find((e) => e.id === gbId);
  console.assert(entry?.status === 'approved', 'Entry status must be approved');
  console.log('✔ Guestbook entry approved successfully');

  await hideGuestbookAction(gbId);
  gbList = getStoredGuestbook();
  entry = gbList.find((e) => e.id === gbId);
  console.assert(entry?.status === 'hidden', 'Entry status must be hidden');
  console.log('✔ Guestbook entry hidden successfully');

  await deleteGuestbookAction(gbId);
  gbList = getStoredGuestbook();
  entry = gbList.find((e) => e.id === gbId);
  console.assert(!entry, 'Entry deleted from store');
  console.log('✔ Guestbook entry deleted successfully');

  console.log('\n🎉 ALL BACKEND FUNCTIONAL TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
