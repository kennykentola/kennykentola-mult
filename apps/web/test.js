const { marked } = require('marked');

const text = `<!DOCTYPE html>
<html lang="en">
<head>
<style>
    .blog-post {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>
</head>
<body>

<article class="blog-post">
    <h1>Building an App with AI: A Step-by-Step Guide</h1>
    
    <p>In today's digital age...</p>

    <h2>Step 1: Define the Project Requirements</h2>
    <p>Before we dive into...</p>
</article>

</body>
</html>
![Image](https://res.cloudinary.com/dlf0th3fx/image/upload/v1783208355/kennykentola/blog/chkqymb7tgqwmzhlkxtu.jpg)`;

console.log(marked.parse(text));
