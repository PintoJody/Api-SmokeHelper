const mongoose = require('mongoose');

mongoose.connect(
   process.env.ATLAS_URI,
   {
    useNewUrlParser: true,
    useUnifiedTopology: true
    },
   (err) => {
       if(!err) console.log("Mongodb connected");
       else console.log("Connection error :" + err);
   }
)