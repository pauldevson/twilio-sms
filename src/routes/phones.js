import { Router } from 'express';
// import Twilio from 'twilio';
import phonesController from '../controllers/phonesController';
import Phone from '../models/phoneModel';

// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;
// const twilio = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const controller = phonesController(Phone);
const router = Router();

router.route('/').post(controller.post);
router
  .route('/:phoneNumber')
  .get(controller.get)
  .patch(controller.patch);

export default router;
