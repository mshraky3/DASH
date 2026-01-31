import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import cors from "cors";
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(bodyParser.json());

// ============ JSON FILE DATABASE HELPER FUNCTIONS ============

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function writeJSON(filename, data) {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Initialize data files if they don't exist
function initializeData() {
    if (!readJSON('accounts.json')) {
        writeJSON('accounts.json', { accounts: [], nextAccountId: 1 });
    }
    if (!readJSON('posts.json')) {
        writeJSON('posts.json', { posts: [], nextPostId: 1 });
    }
    if (!readJSON('post_images.json')) {
        writeJSON('post_images.json', { images: [], nextImageId: 1 });
    }
}

initializeData();

// ============ API ROUTES ============

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        const data = readJSON('accounts.json');
        const account = data.accounts.find(a => a.username === email);

        if (account && account.password === password) {
            res.json({
                message: "Login successful",
                stats: 200,
                id: account.id,
                account_type: account.account_type
            });
        } else {
            res.json({ stats: 201 });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.json({ stats: 404 });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, username, password, location, phone_number, email, website_url, description, account_type } = req.body;
        const logo_image = req.files?.logo_image;

        if (!name || !username || !password || !location || !phone_number || !email || !account_type) {
            return res.status(400).json({ mseeg: "All fields are required." });
        }

        if (password.length < 8) {
            return res.status(400).json({ mseeg: "The password must be more than 8 characters long." });
        }

        if (!logo_image) {
            return res.status(400).json({ mseeg: "Please select an image." });
        }

        if (logo_image.size > 50 * 1024 * 1024) {
            return res.status(400).json({ mseeg: "Image size must be under 50 MB." });
        }

        const data = readJSON('accounts.json');
        const existingAccount = data.accounts.find(a => a.username === username);

        if (existingAccount) {
            return res.status(400).json({ mseeg: "Username is already used, try to login or use another username." });
        }

        let webpImageBase64 = '';
        try {
            const webpBuffer = await sharp(logo_image.data).webp({ quality: 80 }).toBuffer();
            webpImageBase64 = webpBuffer.toString('base64');
        } catch (sharpError) {
            console.error("Image conversion error:", sharpError);
            return res.status(400).json({ mseeg: "Invalid image file. Please upload a valid image." });
        }

        const newAccount = {
            id: data.nextAccountId,
            username,
            password,
            name,
            logo_image: webpImageBase64,
            location,
            phone_number,
            email,
            website_url: website_url || '',
            rating: 0,
            rating_length: 0,
            description: description || '',
            account_type
        };

        data.accounts.push(newAccount);
        data.nextAccountId++;
        writeJSON('accounts.json', data);

        return res.status(200).json({ message: "Registration successful! Please login." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mseeg: "An error occurred during registration." });
    }
});

app.get("/api/Posts", async (req, res) => {
    try {
        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const postsWithImages = postsData.posts.map(post => {
            const imagesForPost = imagesData.images
                .filter(img => img.post_id === post.post_id)
                .map(img => ({
                    image_id: img.image_id,
                    image: img.image || null
                }));
            return {
                ...post,
                images: imagesForPost
            };
        });

        res.status(200).json({ success: true, data: postsWithImages });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ success: false, error: "An error occurred while fetching posts." });
    }
});

app.post("/api/profile", async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Account ID is required" });
    }
    try {
        const accountsData = readJSON('accounts.json');
        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const account = accountsData.accounts.find(a => a.id === parseInt(id));
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        const accountPosts = postsData.posts.filter(p => p.account_id === account.id);
        const postsWithImages = accountPosts.map(post => {
            const images = imagesData.images
                .filter(img => img.post_id === post.post_id)
                .map(img => ({ image_id: img.image_id, image: img.image }));
            return { ...post, images };
        });

        res.status(200).json({
            account_id: account.id,
            username: account.username,
            name: account.name,
            logo_image: account.logo_image,
            location: account.location,
            phone_number: account.phone_number,
            email: account.email,
            website_url: account.website_url,
            rating: account.rating,
            rating_length: account.rating_length,
            description: account.description,
            account_type: account.account_type,
            posts: postsWithImages
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/addpost", async (req, res) => {
    try {
        const { account_name, location, description, account_id, post_title } = req.body;

        if (!req.files || !req.files.images) {
            return res.status(400).json({ error: "No images uploaded." });
        }

        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const newPost = {
            post_id: postsData.nextPostId,
            account_name,
            location,
            description,
            account_id: parseInt(account_id),
            post_title
        };

        postsData.posts.push(newPost);
        postsData.nextPostId++;

        for (const image of images) {
            const webpBuffer = await sharp(image.data).webp({ quality: 80 }).toBuffer();
            const newImage = {
                image_id: imagesData.nextImageId,
                image: webpBuffer.toString('base64'),
                post_id: newPost.post_id
            };
            imagesData.images.push(newImage);
            imagesData.nextImageId++;
        }

        writeJSON('posts.json', postsData);
        writeJSON('post_images.json', imagesData);

        res.status(200).json({ message: "Post added successfully!" });
    } catch (err) {
        console.error("Error adding post:", err);
        res.status(500).json({ error: "An error occurred while adding the post." });
    }
});

// ============ EJS VIEW ROUTES ============

// Home page
app.get("/", async (req, res) => {
    try {
        const accountsData = readJSON('accounts.json');
        const postsData = readJSON('posts.json');

        const formatAccounts = (type) => {
            return accountsData.accounts
                .filter(a => a.account_type === type)
                .slice(0, 3)
                .map(a => {
                    const post = postsData.posts.find(p => p.account_id === a.id);
                    return {
                        id: a.id,
                        name: a.name,
                        location: a.location,
                        phone_number: a.phone_number,
                        rating: a.rating,
                        title: post?.post_title || '',
                        images: a.logo_image ? [a.logo_image] : []
                    };
                });
        };

        const companies = formatAccounts('company');
        const contractors = formatAccounts('contractor');
        const freelancers = formatAccounts('freelancer');

        res.render('profile', {
            companies,
            contractors,
            freelancers,
            Cnum: Math.max(0, 3 - companies.length),
            COnum: Math.max(0, 3 - contractors.length),
            Fnum: Math.max(0, 3 - freelancers.length),
            num: Math.max(0, 3 - contractors.length),
            date: new Date().getFullYear()
        });
    } catch (err) {
        console.error("Error loading home page:", err);
        res.render('profile', {
            companies: [], contractors: [], freelancers: [],
            Cnum: 3, COnum: 3, Fnum: 3, num: 3,
            date: new Date().getFullYear()
        });
    }
});

// Login page
app.get("/login", (req, res) => {
    res.render('login', {});
});

// Register page
app.get("/register", (req, res) => {
    res.render('register', {});
});

// Login POST
app.post("/profile", async (req, res) => {
    const { username, password } = req.body;
    try {
        const data = readJSON('accounts.json');
        const account = data.accounts.find(a => a.username === username && a.password === password);

        if (account) {
            res.redirect(`/account/type/${account.id}`);
        } else {
            res.render('login', { mseeg: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.render('login', { mseeg: "An error occurred" });
    }
});

// Register POST
app.post("/register", async (req, res) => {
    try {
        const { name, username, password, location, phone_number, email, website_url, description, account_type } = req.body;
        const logo_image = req.files?.logo_image;

        if (!name || !username || !password || !location || !phone_number || !email || !account_type) {
            return res.render('register', { mseeg: "All fields are required." });
        }

        if (password.length < 8) {
            return res.render('register', { mseeg: "The password must be more than 8 characters long." });
        }

        if (!logo_image) {
            return res.render('register', { mseeg: "Please select an image." });
        }

        const data = readJSON('accounts.json');
        if (data.accounts.find(a => a.username === username)) {
            return res.render('register', { mseeg: "Username is already used." });
        }

        let webpImageBase64 = '';
        try {
            const webpBuffer = await sharp(logo_image.data).webp({ quality: 80 }).toBuffer();
            webpImageBase64 = webpBuffer.toString('base64');
        } catch (sharpError) {
            return res.render('register', { mseeg: "Invalid image file." });
        }

        const newAccount = {
            id: data.nextAccountId,
            username, password, name,
            logo_image: webpImageBase64,
            location, phone_number, email,
            website_url: website_url || '',
            rating: 0, rating_length: 0,
            description: description || '',
            account_type
        };

        data.accounts.push(newAccount);
        data.nextAccountId++;
        writeJSON('accounts.json', data);

        res.render('login', { mseeg: "Registration successful! Please login." });
    } catch (err) {
        console.error(err);
        res.render('register', { mseeg: "An error occurred during registration." });
    }
});

// List page by type
app.get("/list/:type", async (req, res) => {
    const { type } = req.params;
    try {
        const data = readJSON('accounts.json');
        const companies = data.accounts
            .filter(a => a.account_type === type)
            .map(a => ({
                id: a.id,
                name: a.name,
                location: a.location,
                phone_number: a.phone_number,
                rating: a.rating,
                title: a.description?.substring(0, 50) || '',
                logo_image: a.logo_image ? [a.logo_image] : []
            }));

        res.render('list', { companies, type, posts: false });
    } catch (err) {
        console.error("Error:", err);
        res.render('list', { companies: [], type, posts: false });
    }
});

// Uploaded posts by type
app.post("/uploaded", async (req, res) => {
    const { upload_type } = req.body;
    try {
        const accountsData = readJSON('accounts.json');
        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const accountIds = accountsData.accounts
            .filter(a => a.account_type === upload_type)
            .map(a => a.id);

        const filteredPosts = postsData.posts.filter(p => accountIds.includes(p.account_id));

        const companies = filteredPosts.map(post => {
            const images = imagesData.images
                .filter(img => img.post_id === post.post_id)
                .map(img => img.image);
            return {
                id: post.post_id,
                name: post.account_name,
                location: post.location,
                title: post.post_title,
                number: '',
                rating: 0,
                images
            };
        });

        res.render('list', { companies, type: upload_type, posts: true });
    } catch (err) {
        console.error("Error:", err);
        res.render('list', { companies: [], type: upload_type, posts: true });
    }
});

// Post detail page
app.get("/post/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    try {
        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const post = postsData.posts.find(p => p.post_id === parseInt(id));
        if (!post) {
            return res.redirect('/');
        }

        const images = imagesData.images
            .filter(img => img.post_id === post.post_id)
            .map(img => img.image);

        const data = {
            post_id: post.post_id,
            account_name: post.account_name,
            location: post.location,
            description: post.description,
            post_title: post.post_title,
            account_id: post.account_id,
            images: images.length > 0 ? images : ['']
        };

        res.render('post', { data, type, account_id: null });
    } catch (err) {
        console.error("Error:", err);
        res.redirect('/');
    }
});

// Account detail page
app.get("/account/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    try {
        const accountsData = readJSON('accounts.json');
        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const account = accountsData.accounts.find(a => a.id === parseInt(id));
        if (!account) {
            return res.redirect('/');
        }

        const accountPosts = postsData.posts.filter(p => p.account_id === account.id);
        const posts = accountPosts.map(post => {
            const images = imagesData.images
                .filter(img => img.post_id === post.post_id)
                .map(img => img.image);
            return {
                post_id: post.post_id,
                title: post.post_title,
                description: post.description,
                location: post.location,
                images
            };
        });

        res.render('uers-profile', {
            account: {
                id: account.id,
                name: account.name,
                location: account.location,
                phone_number: account.phone_number,
                email: account.email,
                website_url: account.website_url,
                rating: account.rating,
                description: account.description,
                account_type: account.account_type,
                logo_image: account.logo_image || ''
            },
            posts,
            type
        });
    } catch (err) {
        console.error("Error:", err);
        res.redirect('/');
    }
});

// Upload post page
app.post("/upload_post", async (req, res) => {
    const { upload_type } = req.body;
    res.render('upload_post', { account: null, list_type: upload_type });
});

// Upload new post
app.post("/upload_new_post", async (req, res) => {
    try {
        const { companyName, accountID, title, location, details, type } = req.body;
        const images = req.files?.image;

        if (!images) {
            return res.redirect('/');
        }

        const imageArray = Array.isArray(images) ? images : [images];

        const postsData = readJSON('posts.json');
        const imagesData = readJSON('post_images.json');

        const newPost = {
            post_id: postsData.nextPostId,
            account_name: companyName,
            location,
            description: details,
            account_id: parseInt(accountID),
            post_title: title
        };

        postsData.posts.push(newPost);
        postsData.nextPostId++;

        for (const img of imageArray) {
            const webpBuffer = await sharp(img.data).webp({ quality: 80 }).toBuffer();
            imagesData.images.push({
                image_id: imagesData.nextImageId,
                image: webpBuffer.toString('base64'),
                post_id: newPost.post_id
            });
            imagesData.nextImageId++;
        }

        writeJSON('posts.json', postsData);
        writeJSON('post_images.json', imagesData);

        res.redirect(`/account/type/${accountID}`);
    } catch (err) {
        console.error("Error:", err);
        res.redirect('/');
    }
});

// Comment on post
app.post("/comment", async (req, res) => {
    const { post_id } = req.body;
    res.redirect(`/post/type/${post_id}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;


