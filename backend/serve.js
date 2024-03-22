const express = require('express');
const { userRoutes } = require('./Routes/user');
const { adminRoutes } = require('./Routes/admin');
const url = require('url');
const cors = require('cors');
const app=express();
const PORT=8000

app.set('view engine','ejs')
app.set('views','views')

app.use(cors())
app.use(express.static('static'))
app.use('/',userRoutes)
app.use('/admin',adminRoutes)
app.get('/cities',(req,res)=>{
    let data={
      "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Tiruchirappalli",
        "Salem",
        "Tirunelveli",
        "Tiruppur",
        "Ranipet",
        "Nagercoil",
        "Thanjavur",
        "Vellore",
        "Kancheepuram",
        "Erode",
        "Tiruvannamalai",
        "Pollachi",
        "Rajapalayam",
        "Sivakasi",
        "Pudukkottai",
        "Neyveli (TS)",
        "Nagapattinam",
        "Viluppuram",
        "Tiruchengode",
        "Vaniyambadi",
        "Theni Allinagaram",
        "Udhagamandalam",
        "Aruppukkottai",
        "Paramakudi",
        "Arakkonam",
        "Virudhachalam",
        "Srivilliputhur",
        "Tindivanam",
        "Virudhunagar",
        "Karur",
        "Valparai",
        "Sankarankovil",
        "Tenkasi",
        "Palani",
        "Pattukkottai",
        "Tirupathur",
        "Ramanathapuram",
        "Udumalaipettai",
        "Gobichettipalayam",
        "Thiruvarur",
        "Thiruvallur",
        "Panruti",
        "Namakkal",
        "Thirumangalam",
        "Vikramasingapuram",
        "Nellikuppam",
        "Rasipuram",
        "Tiruttani",
        "Nandivaram-Guduvancheri",
        "Periyakulam",
        "Pernampattu",
        "Vellakoil",
        "Sivaganga",
        "Vadalur",
        "Rameshwaram",
        "Tiruvethipuram",
        "Perambalur",
        "Usilampatti",
        "Vedaranyam",
        "Sathyamangalam",
        "Puliyankudi",
        "Nanjikottai",
        "Thuraiyur",
        "Sirkali",
        "Tiruchendur",
        "Periyasemur",
        "Sattur",
        "Vandavasi",
        "Tharamangalam",
        "Tirukkoyilur",
        "Oddanchatram",
        "Palladam",
        "Vadakkuvalliyur",
        "Tirukalukundram",
        "Uthamapalayam",
        "Surandai",
        "Sankari",
        "Shenkottai",
        "Vadipatti",
        "Sholingur",
        "Tirupathur",
        "Manachanallur",
        "Viswanatham",
        "Polur",
        "Panagudi",
        "Uthiramerur",
        "Thiruthuraipoondi",
        "Pallapatti",
        "Ponneri",
        "Lalgudi",
        "Natham",
        "Unnamalaikadai",
        "P.N.Patti",
        "Tharangambadi",
        "Tittakudi",
        "Pacode",
        "O' Valley",
        "Suriyampalayam",
        "Sholavandan",
        "Thammampatti",
        "Namagiripettai",
        "Peravurani",
        "Parangipettai",
        "Pudupattinam",
        "Pallikonda",
        "Sivagiri",
        "Punjaipugalur",
        "Padmanabhapuram",
        "Thirupuvanam"
      ]
    }
    let q=url.parse(req.url,true).query;
    let filters=data['Tamil Nadu'].filter((city)=>{
      if(city.toLowerCase().indexOf(q.search_q)!=-1) return city;
    });
    res.json({0:filters})
})
app.listen(PORT,(err)=>{
    console.log("Listining on PORT : "+PORT);
})