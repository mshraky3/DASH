import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import fileUpload from "express-fileupload"
import multer from 'multer';
import dotenv from 'dotenv';
import cors from "cors";
dotenv.config();
const app = express();
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: !0}));
cors({origin: "*",methods: ["GET", "POST"],allowedHeaders: ["Content-Type", "Authorization"]})
app.use(cors());
app.use(bodyParser.json());


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
});

// const db=new pg.Client({user:"users_x5qf_user",host:"dpg-crd1mqg8fa8c73bg324g-a",port:5432,password:"gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",database:"users_x5qf",})
const db = new pg.Client({password: "Ejc9c123",host: "localhost",database: "DASH",user: "postgres",port: 5432})
db.connect()


app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        const result = await db.query(`
      SELECT id, password, account_type 
      FROM account 
      WHERE username = $1
    `, [email]);
        if (result.rows.length > 0 && result.rows[0].password === password) {
            res.sendStatus(200)
        } else {
            res.sendStatus(201)
        }
    } catch (err) {
         res.sendStatus(404)
    }
});


app.post("/api/register", async (req, res) => { 
    try {
        const {
            name,
            username,
            password,
            location,
            phone_number,
            email,
            website_url,
            description,
            account_type,
        } = req.body;

        const logo_image = req.files.logo_image; // Get the uploaded file
        
        // Validate required fields
        if (!name || !username || !password || !location || !phone_number || !email || !account_type) {
            return res.status(400).json({ mseeg: "All fields are required." });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ mseeg: "The password must be more than 8 characters long." });
        }

        // Validate file upload
        if (!logo_image) {
            return res.status(400).json({ mseeg: "Please select an image." });
        }

        if (logo_image.size > 50 * 1024 * 1024) {
            return res.status(400).json({ mseeg: "Image size must be under 50 MB." });
        }

        // Check if the username already exists
        const checkResult = await db.query("SELECT 1 FROM account WHERE username = $1", [username]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ mseeg: "Username is already used, try to login or use another username." });
        }

        
        const insertQuery = `
            INSERT INTO account (
                username, password, name, logo_image, location, phone_number, email, website_url, rating, description, account_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        const values = [
            username,
            password,
            name,
            logo_image.buffer, // Store the binary data of the image
            location,
            phone_number,
            email,
            website_url,
            0, // Default rating
            description,
            account_type,
        ];
       
        const dbres = await db.query(insertQuery, values);
        console.log(dbres)
        // Return success response
        return res.status(200).json({ message: "Registration successful! Please login." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ mseeg: "An error occurred during registration." });
    }
});

app.get("/api/Posts", async (req, res) => {
    try {
        // Query to fetch all posts
        const postsQuery = `
            SELECT 
                p.post_id,
                p.account_name,
                p.location,
                p.description,
                p.account_id,
                p.post_title,
                p.post_type
            FROM 
                posts p
        `;
        const postsResult = await db.query(postsQuery);

        // Extract post IDs for fetching images
        const postIds = postsResult.rows.map(post => post.post_id);

        // Query to fetch all images for the fetched posts
        const imagesQuery = `
            SELECT 
                pi.image_id,
                pi.image,
                pi.post_id
            FROM 
                post_images pi
            WHERE 
                pi.post_id = ANY($1)
        `;
        const imagesResult = await db.query(imagesQuery, [postIds]);

        // Organize the data into a structured format
        const postsWithImages = postsResult.rows.map(post => {
            const imagesForPost = imagesResult.rows
                .filter(imageRow => imageRow.post_id === post.post_id)
                .map(imageRow => ({
                    image_id: imageRow.image_id,
                    image: imageRow.image ? imageRow.image.toString('base64') : null // Convert binary image data to Base64
                }));

            return {
                post_id: post.post_id,
                account_name: post.account_name,
                location: post.location,
                description: post.description,
                account_id: post.account_id,
                post_title: post.post_title,
                post_type: post.post_type,
                images: imagesForPost // Attach images to the corresponding post
            };
        });
        
        console.log(postsWithImages);
        res.status(200).json({
            success: true,
            data: postsWithImages
        });
    } catch (err) {
        console.error("Error fetching posts and images:", err);
        res.status(500).json({
            success: false,
            error: "An error occurred while fetching posts and images."
        });
    }
});








app.listen(process.env.port, () => {
  console.log('Server is running on port' + process.env.port);
});


