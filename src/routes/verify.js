import { Router } from 'express';
import Twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;
const router = Router();
const twilio = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

router
  .route('/')
  .get(async (req, res) => {
    const { phoneNumber, channel = 'sms' } = req.query;
    console.log(req.query);

    let twilioVerification;
    try {
      twilioVerification = await twilio.verify
        .services(VERIFICATION_SID)
        .verifications.create({ to: phoneNumber, channel });
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }
    console.log(twilioVerification);
    return res.json({ status: 'Ok', twilioVerification });
  })
  .post(async (req, res) => {
    const {
      verificationCode: code,
      phoneNumber,
      verificationId = null,
    } = req.body;

    let verificationResult;

    try {
      verificationResult = await twilio.verify
        .services(VERIFICATION_SID)
        .verificationChecks.create({
          code,
          to: phoneNumber,
          verificationSid: verificationId,
        });
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }

    console.debug(verificationResult);

    if (verificationResult.status === 'approved') {
      req.user.role = 'access secret content';
      await req.user.save();
      return res.json({
        status: 'ok',
        message: 'Phone number is verified',
        verificationResult,
      });
    }

    // Error
    return res.json({
      status: 'error',
      error: `Unable to verify code. status: ${verificationResult.status}`,
    });
  });

export default router;
