const Posts = require("../models/Posts");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;

const { success, error } = require("../utils/responseWrapper");

const createPostController = async (req, res) => {
    try {

        const { caption, postImg } = req.body;
        if (!caption || !postImg) {
            res.send(error(400, 'caption and post image is required'));
        }

        const cloudImg = await cloudinary.uploader.upload(postImg, {
            folder: 'postImg'
        })

        const Owner = req._id;

        const user = await User.findById(req._id);

        const post = await Posts.create({
            Owner,
            caption,
            image: {
                publicId: cloudImg.public_id,
                url: cloudImg.url
            }
        })

        user.posts.push(post._id);
        await user.save();

        return res.send(success(200, { post }));

    } catch (e) {
        res.send(error(500, e.message))
    }
}
const likeAndUnlikePost = async (req, res) => {

    try {

        const { postId } = req.body;
        const curUserId = req._id;
        const post = await Posts.findById(postId).populate('Owner');
        if (!post) {
            return res.send(error(404, 'post not found'));
        }

        if (post.likes.includes(curUserId)) {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);

        } else {
            post.likes.push(curUserId);
        }
        await post.save();
        return res.send(success(200, { post: mapPostOutput(post, req._id) }));

    } catch (e) {
        return res.send(error(500, e.message));
    }


}

const updatePostController = async (req, res) => {

    try {

        const { postId, caption } = req.body;
        const curUserId = req._id;

        const Post = await Posts.findById(postId)
        if (!Post) {
            return res.send(error(404, 'Post not found'));
        }

        if (Post.Owner.toString() !== curUserId) {
            return res.send(error(403, 'Only owner can update post'));
        }

        if (caption) {
            Post.caption = caption;
        }

        await Post.save();

        return res.send(success(202, { Post }));

    } catch (e) {
        return res.send(error(500, e.message));
    }



}

const deletePost = async (req, res) => {

    try {
        const { postId } = req._id;
        const curUserId = req.body;

        const post = await Posts.findById(postId);
        const curUser = await User.findById(curUserId);

        if (!post) {
            return res.send(error(404, 'post not found'));
        }

        if (post.Owner.toString() !== curUserId) {
            return res.send(error(403, 'Only owners can delete their post'));
        }

        const index = curUser.Post.indexOf(postId);
        curUser.Post.splice(index, 1);
        await curUser.save();
        await post.remove();

        return res.send(success(200, 'post deleted'));
    } catch (e) {
        res.send(error(500, e.message))
    }

}





module.exports = {
    createPostController,
    likeAndUnlikePost,
    updatePostController,
    deletePost,

}