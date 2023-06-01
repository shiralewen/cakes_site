const express = require("express");
const bcrypt = require("bcrypt");

const { UserModel, validateUser,validateLogin, genToken } = require("../models/userModel");
const { authToken } = require("../auth/authToken");
const router = express.Router();

router.get("/",async(req,res)=>{
  res.json({msg:"Users work"})
})

router.get("/", async (req, res) => {
    let perPage = Math.min(req.query.perPage,20) || 5;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";

    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let data = await UserModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({[sort]:reverse})
        res.json(data);
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/userInfo",authToken,async(req,res)=>{
  let user=await UserModel.findOne({_id:req.tokenData._id},{password:0});
  res.json(user);
})

router.get("/myEmail",authToken,async(req,res)=>{
  try{
  let user=await UserModel.findOne({_id:req.tokenData._id},{email:1});
  res.json(user);
}
catch(err){
      
  console.log(err)
  res.status(500).json({msg:"err",err})
}
})
// http://localhost:3000/countries/?perPage=4
// http://localhost:3000/countries/?page=2&perPage=3
// http://localhost:3000/countries/?page=2&perPage=3&sort=name



router.post("/", async (req, res) => {
    let validBody = validateUser(req.body)
    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    } try {
        let user = new UserModel(req.body)
        user.password=await bcrypt.hash(user.password,10)
        await user.save();
        res.status(201).json(user)
    } catch (err) {
        if(err.code==11000){
            return res.status(400).json({ msg: "email already in system try login", code:11000 })
        }
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})



router.post("/login", async(req,res) => {
    let valdiateBody = validateLogin(req.body);
    if(valdiateBody.error){
      return res.status(400).json(valdiateBody.error.details)
    }
    try{
      // לבדוק אם המייל שנשלח בכלל יש רשומה של משתמש שלו
      let user = await UserModel.findOne({email:req.body.email})
      if(!user){
        // שגיאת אבטחה שנשלחה מצד לקוח
        return res.status(401).json({msg:"User and password not match 1"})
      }
      // בדיקה הסימא אם מה שנמצא בבאדי מתאים לסיסמא המוצפנת במסד
      let validPassword = await bcrypt.compare(req.body.password, user.password);
      if(!validPassword){
        return res.status(401).json({msg:"User and password not match 2"})
      }
      // בשיעור הבא נדאג לשלוח טוקן למשתמש שיעזור לזהות אותו 
      // לאחר מכן לראוטרים מסויימים
      
      let newToken=genToken(user._id);
      // res.json({msg:"Success, Need to send to client the token"});
      res.json({token:newToken});
    }
    catch(err){
      
      console.log(err)
      res.status(500).json({msg:"err",err})
    }
  })


// router.delete("/:idDel",async(req,res)=>{
//     try{
//         let idDel=req.params.idDel;
//         let data=await UserModel.deleteOne({_id:idDel});
//         res.json(data);
//     }
//     catch(err){
//         console.log(err);
//         res.status(500).json({ msg: "err", err })
//     }
// })


// router.put("/:idEdit",async(req,res)=>{
//     let validBody=validateUser(req.body);

//     if(validBody.error){
//         return res.status(400).json(validBody,error.details);
//     }

//     try{
//         let idEdit=req.params.idEdit;
//         let data=await UserModel.updateOne({_id:idEdit},req.body);
//         res.json(data);
//     }
//     catch(err){
//         console.log(err);
//         res.status(500).json({ msg: "err", err })
//     }
// })

module.exports = router;