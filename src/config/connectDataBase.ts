import { set, connect } from 'mongoose';

const connectDB = async () => {
    try {
        set("strictQuery", false);
        const conn = await connect(process.env.MONGO_URL, { dbName: process.env.DB });
        console.log(`MongoDB Connected : ${conn.connection.host}`);
    } catch (err) {
        console.log(err.message)
        // console.log(err);
        process.exit(1);
    }
}

export default connectDB;