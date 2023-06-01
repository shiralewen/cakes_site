const mongoose=require("mongoose");
const Joi=require("joi");

const cakeSchema=new mongoose.Schema({
    name:String,
    cals:String,
    price:Number,
    user_id:String
})

exports.CakeModel=mongoose.model("cakes",cakeSchema);

exports.validateCake=(_reqBody)=>{
    let joiSchema=Joi.object({
       name:Joi.string().min(2).max(99).required(),
       cals:Joi.string().min(2).max(99).required(),
       price:Joi.number().min(1).max(99999).required(),
    })

    return joiSchema.validate(_reqBody);
}
