const express= require('express');
const BodyParser= require('body-parser');
const mongoose=require('mongoose');
const app=express();
const nodemailer=require('nodemailer');
const cron = require('node-cron');
const cookieParser = require("cookie-parser");
const CryptoJS = require("crypto-js");
const fs=require('fs');


app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(BodyParser.urlencoded({extended:true}));

var username= "";

var answer="";
var em="vallihussain999@gmail.com";

var userlimit=300;

function calculate(u){
    var bill=0;
    if(u<=50){
        bill= u*1.45;
      }
      if(u>50 && u<=75){
      bill=(u-50)*2.6 + 50*1.45;
      }
      if(u>75 && u<=100){
      bill=(u-50)*2.6 + 50*2.6;
      }
      if(u>100 && u<=200){
      bill=(u-100)*3.6 + 50*2.6*2;
      }
      if(u>200 && u<=225){
      bill=(u-200)*6.9 + 100*3.6 + 2*50*2.6;
      }
      
      if(u>225 && u<=300){
      bill=(u-200)*7.1 + 100*5.4 + 50*3.35 + 50*2.65;
      }
      if( u>300 && u<=400){
      bill=(u-300)*7.95 + 100*7.1 + 100*5.4 + 50*3.35 + 50*2.65;
      }
      if(u>400 && u<=500){
      bill=(u-400)*8.5 + 100*7.95 + 100*7.1 + 100*5.4 + 50*3.35 + 50*2.65;
      }
      if(u>500){
      bill=(u-500)*9.95 + 100*8.5 + 100*7.95 + 100*7.1 + 100*5.4 + 50*3.35 + 50*2.65;
      }
      return bill;

}

mongoose.connect("mongodb+srv://valli_0327:valli0327@cluster0.z5kvq.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

const userSchema ={
    Fname:String,
    Lname:String,
    phNumber:Number,
    email:String,
    password:String,
    cpassword:String
};

const Limit={
    username:String,
    limit:Number
};

const User= new mongoose.model("User",userSchema);
const Li=new mongoose.model("Li",Limit);




app.get('/',function(req,res){
    res.cookie("bpid", "initial");
    res.render('home');
});

app.get('/prediction',function(req,res){
    if(req.cookies.bpid != "initial"){
        
        res.render('prediction');
    }
    else{
        res.render('error');
    }
    
});

app.get('/signin',function(req,res){
    res.render('signin');
});
app.get('/signup',function(req,res){
    res.render('signup');
});
app.get('/graphs',function(req,res){
    if(req.cookies.bpid != "initial"){
        
        res.render('graphs');
    }
    else{
        res.render('error');
    }
    
});

app.get('/about',function(req,res){
        
        res.render('about');
    
});

app.get('/userinput',function(req,res){
    if (req.cookies.bpid != "initial") {
        res.render('userinput',{answer:answer});
    } 
    else {
        res.redirect("/");
    }
})

app.post("/signup",function(req,res){
    const userDetails = req.body;
    const newUser = new User({
        Fname:req.body.FirstName,
        Lname:req.body.LastName,
        phNumber:req.body.PhoneNumber,
        email: req.body.email,
        password: req.body.Password,
        cpassword:req.body.Cpassword
    });
    em=req.body.email;
    const p=req.body.Password;
    const cp=req.body.Cpassword
    username=req.body.FirstName;
    console.log(em);
    newUser.save(function(err){
        if( err ){
            console.log(err);
        }
        else{
            if(p===cp){
                var transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:'20131a1248@gvpce.ac.in',
                        pass:'Valli@2003'
                    }
                });
                
                var mailOptions={
                    from:'20131a1248@gvpce.ac.in',
                    to:em,
                    subject:'Welcome',
                    text:'WELCOME TO OUR PLATFORM'
                };
                
                transporter.sendMail(mailOptions,function(error,info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Email Sent:'+info.response);
                    }
                });
                res.redirect("/");
            }
            
        }
    });
});

app.post('/limit',function(req,res){
    const L=req.body.number;
    userlimit=L;

    const newLimit= new Li({
        limit:L,
        username:em
    });
    newLimit.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("limit saved");
            res.redirect('/userinput');
        }
    });
    
});

app.post('/calculate',function(req,res){
    var cal=req.body.Number;
    answer=calculate(cal);
    res.render('userinput',{answer:answer});


});

app.post('/signin',function(req,res){
    const email = req.body.Email;
    const password = req.body.password;
    em=req.body.Email;
    console.log(em);
    

    User.findOne({email: email}, function(err,foundUser){
        try{
            if(foundUser.password === password){
                res.cookie("bpid", foundUser._id);
                username=foundUser.Fname;
                res.redirect('main');
                console.log("Login Success");
            }
            else{
                console.log("Login Fail due to wrong password");
                res.redirect('/signin');
            }
        }
        catch(err){
            res.render("notfound");
            console.log("User Not found");
        }
    });
});

app.get('/main',function(req,res){
    if (req.cookies.bpid == "initial") {
        console.log("Login Fail");
        res.redirect("/");
        
    }
    else{
        console.log("Login Success");
        res.render('home1',{Username : username});
    }
    
});

cron.schedule('0 0 19 * *', () => {
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'20131a1248@gvpce.ac.in',
            pass:'Valli@2003'
        }
    });
    
    var mailOptions={
        from:'20131a1248@gvpce.ac.in',
        to:em,
        subject:'Welcome',
        text:'Used 200 Units'
    };
    
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }
        else{
            console.log('Email Sent:'+info.response);
        }
    });
});

// sending messages:
// var monthly_limit,daily_limit,i,extra_units_burned,units_burning,new_day_units_burned,old_units;
// monthly_limit=userlimit;
// var time = new Date();
// units_burning;// taken through file
// daily_limit=monthly_limit/30;
//     i=1;
// while(i<=30){

// new_day_units_burned=units_burning - old_units;
// //using IP calculating units consumed. ( new_day_units= units_burning - old_units)
// if(new_day_units_burned==daily_limit/2)
// {
//     var transporter=nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:'20131a1248@gvpce.ac.in',
//             pass:'Valli@2003'
//         }
//     });
    
//     var mailOptions={
//         from:'20131a1248@gvpce.ac.in',
//         to:em,
//         subject:'Consume Status',
//         text:'50% of your daily limit reached'
//     };
    
//     transporter.sendMail(mailOptions,function(error,info){
//         if(error){
//             console.log(error);
//         }
//         else{
//             console.log('Email Sent:'+info.response);
//         }
//     });
// }
// if(new_day_units_burned==daily_limit*9/10)
// {
// //send a message (90% used) ... start saving ;
// var transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'20131a1248@gvpce.ac.in',
//         pass:'Valli@2003'
//     }
// });

// var mailOptions={
//     from:'20131a1248@gvpce.ac.in',
//     to:em,
//     subject:'Consume Status',
//     text:'90% of your daily limit consumed'
// };

// transporter.sendMail(mailOptions,function(error,info){
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log('Email Sent:'+info.response);
//     }
// });
// }
// if(new_day_units_burned==daily_limit)
// {
//     var transporter=nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:'20131a1248@gvpce.ac.in',
//             pass:'Valli@2003'
//         }
//     });
    
//     var mailOptions={
//         from:'20131a1248@gvpce.ac.in',
//         to:em,
//         subject:'Consume Status',
//         text:'100% of your daily limit consumed,Your limit is exceding'
//     };
    
//     transporter.sendMail(mailOptions,function(error,info){
//         if(error){
//             console.log(error);
//         }
//         else{
//             console.log('Email Sent:'+info.response);
//         }
//     });
// }

// if(time.getHours()%24===0)
// {   extra_units_burned=new_day_units_burned - daily_limit;
//    cout<<"yesterdays output"<<endl;
//    cout<<" total burned today"<<new_day_units_burned<<"  "<<"extra burned"<<extra_units_burned<<endl;
// old_units=old_units+new_day_units_burned;
// i++;
// }
// }

// if(units_burning===(monthly_limit/2)){
// // send a msg (you reached 50% of monthly limit);
// var transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'20131a1248@gvpce.ac.in',
//         pass:'Valli@2003'
//     }
// });

// var mailOptions={
//     from:'20131a1248@gvpce.ac.in',
//     to:em,
//     subject:'Consume Status',
//     text:'50% of your monthly limit consumed'
// };

// transporter.sendMail(mailOptions,function(error,info){
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log('Email Sent:'+info.response);
//     }
// });
// }
// if(units_burning===monthly_limit*9/10){
// //send a msg ( !! ALERT ALERT... 90% consumed of monthly limit);
// var transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'20131a1248@gvpce.ac.in',
//         pass:'Valli@2003'
//     }
// });

// var mailOptions={
//     from:'20131a1248@gvpce.ac.in',
//     to:em,
//     subject:'Consume Status',
//     text:'90% of your monthly limit consumed'
// };

// transporter.sendMail(mailOptions,function(error,info){
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log('Email Sent:'+info.response);
//     }
// });
// }
// if(units_burning===monthly_limit)
// {
// //send a msg (!!! YOU HAVE REACHED YOUR LIMIT !! STOP CONSUMING );
// var transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'20131a1248@gvpce.ac.in',
//         pass:'Valli@2003'
//     }
// });

// var mailOptions={
//     from:'20131a1248@gvpce.ac.in',
//     to:em,
//     subject:'Consume Status',
//     text:'100% of your monthly limit consumed,Your limit is exceding,Stop consuming'
// };

// transporter.sendMail(mailOptions,function(error,info){
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log('Email Sent:'+info.response);
//     }
// });
// }
var dailylimit=userlimit/30;
var userdailylimit=0;
 if(userdailylimit===dailylimit/2){
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'20131a1248@gvpce.ac.in',
            pass:'Valli@2003'
        }
    });
    
    var mailOptions={
        from:'20131a1248@gvpce.ac.in',
        to:em,
        subject:'Welcome',
        text:'You have consumed 50% of your daily limit'
    };
    
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }
        else{
            console.log('Email Sent:'+info.response);
        }
    });
 }
 if(userdailylimit===dailylimit){
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'20131a1248@gvpce.ac.in',
            pass:'Valli@2003'
        }
    });
    
    var mailOptions={
        from:'20131a1248@gvpce.ac.in',
        to:em,
        subject:'Welcome',
        text:'You have consumed 100% of your daily limit'
    };
    
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }
        else{
            console.log('Email Sent:'+info.response);
        }
    });

 }

app.get("/logout", function(req, res){
    res.clearCookie();
    console.log("Successfully Loged Out");
    res.redirect("/");
});
// fs.writeFile("text.txt","this is valli");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port,function(){
    console.log("server is running Succesfully");
});

//mailer
