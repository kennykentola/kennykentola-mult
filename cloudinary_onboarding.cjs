const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'dlf0th3fx', 
  api_key: '574733251395475', 
  api_secret: '6Xllef1OxFu8wLQN9LFR-aCD8Q4' 
});

async function run() {
  try {
    // 2. Upload an image
    console.log("Uploading sample image...");
    const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
      public_id: "my_first_upload_demo"
    });
    
    console.log("Upload successful!");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // 3. Get image details
    console.log("\nImage Details:");
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`File size: ${uploadResult.bytes} bytes`);

    // 4. Transform the image
    // f_auto (fetch_format: 'auto'): Automatically selects the best image format for the browser (e.g., WebP or AVIF).
    // q_auto (quality: 'auto'): Intelligently compresses the image to reduce file size without losing visual quality.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("Error during execution:", error);
  }
}

run();
