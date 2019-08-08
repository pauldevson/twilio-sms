import mongoose from 'mongoose';
import { STARTED } from './verificationStatus';

const { Schema } = mongoose;

const phoneModel = new Schema({
  phoneNumber: { type: String },
  // code: { type: String },
  status: { type: String, default: STARTED },
  dateStarted: { type: Date, default: Date.now },
  verifyId: { type: String },
});

export default mongoose.model('Phone', phoneModel);
