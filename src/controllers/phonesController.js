import Twilio from 'twilio';
import { VERIFIED } from '../models/verificationStatus';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;
const channel = 'sms';
const twilio = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default function phonesController(Phone) {
  async function get(req, res) {
    const { phoneNumber } = req.params;
    console.debug(`GET /phones/${phoneNumber}`);

    let phone;
    try {
      phone = await Phone.findOne({ phoneNumber });
      console.log('found:');
      console.debug(phone);
      if (phone !== null) return res.json(phone);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }

    return res.status(404).send(`Not Found: '${phoneNumber}'`);
  }

  async function post(req, res) {
    if (!req.body.phoneNumber) {
      return res.status(400).send('phoneNumber is required');
    }

    let phone = new Phone({ ...req.body });

    console.debug(phone);

    try {
      phone = await phone.save();
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }

    let twilioVerification;
    try {
      twilioVerification = await twilio.verify
        .services(VERIFICATION_SID)
        .verifications.create({
          to: phone.phoneNumber,
          channel,
        });
      console.debug(twilioVerification);
      phone.verifyId = twilioVerification.sid;
      console.log('ABOUT TO SAVE ***********************************');
      await Phone.findOneAndUpdate({ phoneNumber: phone.phoneNumber }, phone);

      return res.json({
        ...phone,
        verification: twilioVerification,
        links: {
          self: `http${req.secure ? 's' : ''}://${
            req.headers.host
          }/api/phones/${phone.phoneNumber}`,
        },
      });
    } catch (error) {
      console.error(error);
      await phone.remove();
      return res.status(500).send(error);
    }
  }

  async function patch(req, res) {
    const { phoneNumber } = req.params;
    const { code } = req.body;

    let phone;
    try {
      phone = await Phone.findOne({ phoneNumber });
      console.debug(phone);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }

    let verificationResult;

    try {
      verificationResult = await twilio.verify
        .services(VERIFICATION_SID)
        .verificationChecks.create({
          code,
          to: phone.phoneNumber,
        });
      console.debug(verificationResult);
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }

    if (verificationResult.status === 'approved') {
      phone.status = VERIFIED;
      await Phone.findOneAndUpdate({ phoneNumber }, phone);
      return res.json({
        ...phone,
        verificationResult,
        links: {
          self: `http${req.secure ? 's' : ''}://${
            req.headers.host
          }/api/phones/${phone.phoneNumber}`,
        },
      });
    }

    // Error
    return res.json({
      status: 'error',
      error: `Unable to verify code. status: ${verificationResult.status}`,
    });
  }

  return { get, post, patch };
}
