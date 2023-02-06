const mongoose = require("mongoose");
const connectionURL = process.env.CONNECATION_URL;
mongoose.set("strictQuery", true);
mongoose.connect(connectionURL, { useNewUrlParser: true });
