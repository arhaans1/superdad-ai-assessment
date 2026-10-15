import { strict as assert } from "assert";
import { assessmentVideo } from "@/lib/video";

const id = "1iqucaUXQrPsrFgCeqPcIPvZBDhq9hKu-";
const preview = `https://drive.google.com/file/d/${id}/preview`;
for (const input of [
  `https://drive.google.com/file/d/${id}/view?usp=drive_link`,
  preview,
  `https://drive.google.com/open?id=${id}`,
  `https://drive.google.com/uc?export=download&id=${id}`
]) {
  assert.deepEqual(assessmentVideo(input), { kind: "embed", src: preview });
}
assert.equal(
  assessmentVideo(`https://drive.google.com/file/d/${id}/view?resourcekey=key123`)?.src,
  `${preview}?resourcekey=key123`
);

for (const input of [
  "https://youtu.be/test-video",
  "https://www.youtube.com/watch?v=test-video",
  "https://www.youtube.com/embed/test-video",
  "https://www.youtube.com/shorts/test-video"
]) {
  assert.deepEqual(assessmentVideo(input), {
    kind: "embed", src: "https://www.youtube.com/embed/test-video"
  });
}
assert.deepEqual(assessmentVideo("https://vimeo.com/123456/secret"), {
  kind: "embed", src: "https://player.vimeo.com/video/123456?h=secret"
});
assert.deepEqual(assessmentVideo("https://player.vimeo.com/video/123456?h=secret"), {
  kind: "embed", src: "https://player.vimeo.com/video/123456?h=secret"
});
assert.deepEqual(assessmentVideo("https://www.loom.com/share/video123"), {
  kind: "embed", src: "https://www.loom.com/embed/video123"
});
assert.deepEqual(assessmentVideo("https://cdn.example.com/video.MP4?token=test"), {
  kind: "file", src: "https://cdn.example.com/video.MP4?token=test"
});
for (const input of [
  "", "not a URL", "javascript:alert(1)", "http://example.com/video.mp4",
  "https://youtube.com.example.com/watch?v=test", "https://drive.google.com/drive/folders/test",
  "https://drive.google.com/file/d/", "https://youtube.com/", "https://example.com/watch"
]) assert.equal(assessmentVideo(input), null);

console.log("Video tests passed: Google Drive embeds, existing providers, MP4 playback, and invalid URLs.");
