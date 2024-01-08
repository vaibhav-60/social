const e = require('express');
const Posts = require('../models/Posts');
const User = require('../models/User');
const { mapPostOutput } = require('../utils/Utils');
const cloudinary = require("cloudinary").v2;

const { error, success } = require('../utils/responseWrapper')

const followOrUnfollowUserController = async (req, res) => {

    try {

        const { userIdToFollow } = req.body;
        const curUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);

        if (curUserId === userIdToFollow) {
            res.send(error(409, 'cannot follow yourself'))
        }

        if (!userToFollow) {
            return res.send(error(404, 'user to follow not found'));
        }

        if (curUser.followings.includes(userIdToFollow)) {
            const followingindex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingindex, 1);

            const followerindex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerindex, 1);


        } else {
            userToFollow.followers.push(curUserId)
            curUser.followings.push(userIdToFollow);

        }

        await userToFollow.save();
        await curUser.save();

        return res.send(success(404, { user: userToFollow }))

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const getPostOfFollowing = async (req, res) => {

    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId).populate('followings');

        const fullpost = await Posts.find({
            Owner: {
                $in: curUser.followings
            },
        }).populate('Owner');
        const posts = fullpost.map(item => mapPostOutput(item, req._id)).reverse();

        const followingsIds = curUser.followings.map(item => item._id);
        followingsIds.push(req._id);
        const suggestions = await User.find({
            _id: {
                $nin: followingsIds
            }
        })
        res.send(success(200, { ...curUser._doc, suggestions, posts }));
    } catch (error) {
        console.log(e);
        return res.send(error(500, e.message));

    }


}

const getMyPost = async (req, res) => {
    try {
        const curUserId = req._id;
        const allUserPosts = await Posts.find({
            Owner: curUserId,
        }).populate('likes');

        return res.send(success(200, { allUserPosts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }

}

const getUserPost = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            res.send(error(400, 'userId is required'))
        }

        const allUserPosts = await Posts.find({
            Owner: userId
        }).populate('likes');

        return res.send(success(200, { allUserPosts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        // delete all posts
        await Posts.deleteMany({
            owner: curUserId,
        });

        // removed myself from followers' followings
        curUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(curUserId);
            follower.followings.splice(index, 1);
            await follower.save();
        });

        // remove myself from my followings' followers
        curUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(curUserId);
            following.followers.splice(index, 1);
            await following.save();
        });

        // remove myself from all likes
        const allPosts = await Posts.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        });

        // delete user
        await curUser.remove();

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, "user deleted"));
    } catch (e) {

        return res.send(error(500, e.message));
    }
};

const getMyInfo = async (req, res) => {

    try {
        const user = await User.findById(req._id);
        return res.send(success(200, { user }))


    } catch (e) {
        return res.send(error(500, e.message))
    }
}

const updateMyProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;

        const user = User.findById(req._id);

        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = name;
        }
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: "profileimg"
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id


            }
        }

        await user.save();
        return res.send(success(200, { user }))


    } catch {
        return res.send(error(500, e.message))
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = await req.body.userId;
        const user = User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });
        const fullpost = user.Posts;
        const post = fullpost.map(item => mapPostOutput(item, req._id)).reverse();

        return res.send(success(200, { ...user._doc, post }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPost,
    getUserPost,
    deleteMyProfile,
    getMyInfo,
    updateMyProfile,
    getUserProfile

}