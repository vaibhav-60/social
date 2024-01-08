const requireUser = require('../middleware/requireUser');
const UserController = require('../controllers/userController');
const router = require('express').Router();

router.post('/follow', requireUser, UserController.followOrUnfollowUserController);
router.get('/getFeedData', requireUser, UserController.getPostOfFollowing);
router.get('/getMyposts', requireUser, UserController.getMyPost);
router.get('/getUserposts', requireUser, UserController.getUserPost);
router.delete('/', requireUser, UserController.deleteMyProfile);
router.get('/', requireUser, UserController.getMyInfo);
router.put('/', requireUser, UserController.updateMyProfile);
router.post('/getUserProfile', requireUser, UserController.getUserProfile);


module.exports = router;