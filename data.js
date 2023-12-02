let express = require("express");
let app = express();

app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const port = process.env.PORT||2410
app.listen(port, () => console.log(`Node app Listening on port ${port}!`));

let {shopsData } = require("./testData.js");
let {productsData } = require("./testData2.js");
let {purchasesData } = require("./testData3.js");

let fs = require("fs");
let fname1 = "shops.json";
let fname2 = "products.json";
let fname3 = "purchases.json";

app.get("/resetData1",function(req,res){
    let data = JSON.stringify(shopsData);
    fs.writeFile(fname1,data,function(err){
        if(err) res.status(404).send(err);
        else res.send("Data in file is reset");
    })
})
app.get("/resetData2",function(req,res){
    let data = JSON.stringify(productsData);
    fs.writeFile(fname2,data,function(err){
        if(err) res.status(404).send(err);
        else res.send("Data in file is reset");
    })
})
app.get("/resetData3",function(req,res){
    let data = JSON.stringify(purchasesData);
    fs.writeFile(fname3,data,function(err){
        if(err) res.status(404).send(err);
        else res.send("Data in file is reset");
    })
})


app.get("/shops", function (req, res) {
    fs.readFile(fname1, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let shopsArray= JSON.parse(data);
            res.send(shopsArray);
        }
    });
});

app.get("/products", function (req, res) {
    fs.readFile(fname2, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let productsArray= JSON.parse(data);
            res.send(productsArray);
        }
    });
});


app.get("/purchases", function (req, res) {
    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchasesArray = JSON.parse(data);

            const { shop, product, sort } = req.query;
            const shopIds = shop ? shop.split(",").map(id => +id) : [];

            if (shopIds.length > 0) {
                purchasesArray = purchasesArray.filter((purchase) => shopIds.includes(purchase.shopId));
            }

            if (product) {
                purchasesArray = purchasesArray.filter((purchase) => purchase.productId === +product);
            }

            if (sort) {
               if(sort === "QtyAsc"){
                purchasesArray = purchasesArray.sort((a,b) => a.quantity - b.quantity);
               }else if(sort === "QtyDesc"){
                purchasesArray = purchasesArray.sort((a,b) => b.quantity - a.quantity);
               }else if(sort === "ValueAsc"){
                purchasesArray = purchasesArray.sort((a,b) => a.quantity*a.price - b.quantity*b.price);
               }else if(sort === "ValueDesc"){
                purchasesArray = purchasesArray.sort((a,b) => b.quantity*b.price - a.quantity*a.price);
               }
            }

            res.send(purchasesArray);
        }
    });
});


app.get("/totalPurchase/shop/:id", function (req, res) {
    const shopId = +req.params.id;

    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const purchasesArray = JSON.parse(data);

    
            const shopPurchases = purchasesArray.filter((purchase) => purchase.shopId === shopId);


            const productTotalPurchase = {};
            shopPurchases.forEach((purchase) => {
                const productId = purchase.productId;
                const quantity = purchase.quantity;
                
                if (!productTotalPurchase[productId]) {
                    productTotalPurchase[productId] = 0;
                }
                productTotalPurchase[productId] += quantity;
            });

            res.send(productTotalPurchase);
        }
    });
});

app.get("/totalPurchase/product/:id", function (req, res) {
    const productId = +req.params.id;

    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const purchasesArray = JSON.parse(data);

            const productPurchases = purchasesArray.filter((purchase) => purchase.productId === productId);

            const shopTotalPurchase = {};
            productPurchases.forEach((purchase) => {
                const shopId = purchase.shopId;
                const quantity = purchase.quantity;

                if (!shopTotalPurchase[shopId]) {
                    shopTotalPurchase[shopId] = 0;
                }
                shopTotalPurchase[shopId] += quantity;
            });

            res.send(shopTotalPurchase);
        }
    });
});




app.get("/purchases/shops/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchasesArray = JSON.parse(data);
            let purchase = purchasesArray.filter((st) => st.shopId === id);
            if (purchase) res.send(purchase);
            else res.status(404).send("No Purchase found");
        }
    });
});


app.get("/products/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname2, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let productsArray = JSON.parse(data);
            let product = productsArray.filter((st) => st.productId === id);
            if (product) res.send(product);
            else res.status(404).send("No Product found");
        }
    });
});

app.get("/purchases/products/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchasesArray = JSON.parse(data);
            let purchase = purchasesArray.filter((st) => st.productId === id);
            if (purchase) res.send(purchase);
            else res.status(404).send("No Purchase found");
        }
    });
});


app.post("/shops", function (req, res) {
    let body = req.body;
    fs.readFile(fname1, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let shopsArray = JSON.parse(data);
            let maxid = shopsArray.reduce(
                (acc, curr) => (curr.shopId > acc ? curr.shopId : acc),
                0
            );
            let newid = maxid + 1;
            let newShop = { shopId: newid, ...body };
            shopsArray.push(newShop);            
            let data1 = JSON.stringify(shopsArray);
            fs.writeFile(fname1, data1, function (err) {
                if (err) res.status(404).send(err);
                else res.send(newShop);
            });
        }
    });
});

app.post("/products", function (req, res) {
    let body = req.body;
    fs.readFile(fname2, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let productsArray = JSON.parse(data);
            let maxid = productsArray.reduce(
                (acc, curr) => (curr.productId > acc ? curr.productId : acc),
                0
            );
            let newid = maxid + 1;
            let newProduct = { productId: newid, ...body };
            productsArray.push(newProduct);            
            let data1 = JSON.stringify(productsArray);
            fs.writeFile(fname2, data1, function (err) {
                if (err) res.status(404).send(err);
                else res.send(newProduct);
            });
        }
    });
});

app.post("/purchases", function (req, res) {
    let body = req.body;
    fs.readFile(fname3, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let purchasesArray = JSON.parse(data);
            let maxid = purchasesArray.reduce(
                (acc, curr) => (curr.purchaseId > acc ? curr.purchaseId : acc),
                0
            );
            let newid = maxid + 1;
            let newPurchase = { purchaseId: newid, ...body };
            purchasesArray.push(newPurchase);            
            let data1 = JSON.stringify(purchasesArray);
            fs.writeFile(fname3, data1, function (err) {
                if (err) res.status(404).send(err);
                else res.send(newPurchase);
            });
        }
    });
});


app.put("/products/:id", function (req, res) {
    let body = req.body;
    let productId = +req.params.id;
    fs.readFile(fname2, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let productsArray = JSON.parse(data);
            let index = productsArray.findIndex((product) => product.productId === productId);
            if (index >= 0) {
                
                let updatedProduct = {
                    productId: productId,
                    productName: productsArray[index].productName,
                    category: body.category || productsArray[index].category,
                    description: body.description || productsArray[index].description
                };
                productsArray[index] = updatedProduct;
                let data1 = JSON.stringify(productsArray);
                fs.writeFile(fname2, data1, function (err) {
                    if (err) res.status(404).send(err);
                    else res.send(updatedProduct);
                });
            } else {
                res.status(404).send("No Product Found");
            }
        }
    });
});




