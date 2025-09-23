const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

//send OTP
exports.sendOTP = async(req, res) =>{
    try {
        // Fetch email from Request body
        const {email} = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({email});
        if( checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already exist",
            })
        }

        //User doesn't exist
        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP Generated :", otp);

        // Check unique otp or not
        const result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

            const otpPayload = {email, otp};
            // create an entry for otp
            const otpBody = await OTP.create(otpPayload);
            console.log("OTP Body : ", otpBody);

            res.status(200).json({
                success : true,
                message:"OTP sent Successfully",
                otp,
            });
    } catch (error) {
        console.log("Error in OTP  generation",error);
    }
};


// SignUP

exports.signup = async(req, res) =>{
    try {
        //fetch data from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        }  = req.body;

        // Do validation
        if(!firstName|| !lastName|| !email || !password || !confirmPassword || !otp){
            return res.status(403). json({
                success:false,
                message:"All fields are required",
            })
        }

        // check both pass are same 
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message:"Password and Confirm Passwoprd value does not match, please try again",
            });
        }

        // check if user alreday exist
        const existingUser =  await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist",
            });
        }

        // Find most recent OTP
        // sorts the documents in descending order (newest first). This means the most recently created OTP will be placed at the top of the result set.
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);
        //Validate otp
        if(recentOTP.length === 0){
            return res.status(400).json({
                success:false,
                message:"OTP Not found",
            })
        } else if(otp != recentOTP[0].otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }

        // OTP Matched
        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)
        // Create Entry in Database
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password : hashedPassword,
            accountType : accountType,
            approved: approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/9.x/initials/svg?seed=${firstName}%20${lastName}`
        })

        return res.status(200).json({
            success:true,
            user,
            message:"User is Registered Successfully"
        });

    } catch (error) {
        console.log("Signup Error, please try again", error);
    }
};


//Login

exports.login = async(req, res) =>{
    try {
        //get data from req body
        const {email, password} = req.body;
        // do validatuion
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"Please fill all the details",
            })
        }

        //Check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not registered, please signup",
            })
        }

        // Generate jwt after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1m",
            });
            
            user.password = undefined;

            return res.status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            });

            //Create cookie
            // const options = {
            //     expires: new Date(Date.now() + 3*24*60*60*1000),
            //     httpOnly: true,
            // }
            // res.cookie("token", token, options).status(200).json({
            //     success:true,
            //     token,
            //     user,
            //     message:"Logged in successfully",
            // })
        }
        else{
            return res.status(401).json({
                success: false,
                message:"Password is incorrect"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Login failure, please try again"
        })
    }
}


// Change password

exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }
  