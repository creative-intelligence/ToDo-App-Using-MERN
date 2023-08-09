const mongoose=require("mongoose")
const bcrypt =require("bcryptjs")
const jwt=require("jsonwebtoken")



const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type: String,
        minlength : 3 ,
        maxlength :1024,
        required: true
    },
    cpassword:{
        type: String,
        minlength : 3 ,
        maxlength :1024,
        required: true
    },
    date:{
        type:Date,
        default: Date.now()
    },
    todos:[{
         todo:{
            type:String,
            required:true
        },
    }],
    tokens:[{
        token:{
          type :String ,
          required:true}
      }]
})


//hashing the passwords before saving to database

userSchema.pre("save", async function (next) {

    if(this.isModified("password")){
   // console.log(`My current password is ${this.password}`);
   this.password = await bcrypt.hash(this.password, 12);
   // console.log(`My current password is ${this.password}`);
   this.cpassword =await bcrypt.hash(this.cpassword, 12);
    }
   
    next();
  });


// we are generating auth Token 

userSchema.methods.generateAuthToken= async function(){
    try{
let token =jwt.sign({_id:this._id},process.env.SECRET_KEY)
this.tokens=this.tokens.concat({token:token})
await this.save();
return token;

    }catch(err){
console.log(err)
    }
}



  const User =mongoose.model("USER",userSchema)

module.exports=User;