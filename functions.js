let mongo = require('mongodb');
class my_functions {

    checkacces(req) {
        if (req.cookies.token) {
            return true;
        } else {
            return false
        };
    }

    insertuser(req, res, mg, admin) {
        mg.connect('mongodb://localhost:27017/mydb', function (err, db) {
            db.collection('users').insertOne(req.body, function (err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                } else {
                    let ID = result.insertedId;
                    res.cookie('token', ID, {
                        httpOnly: false,
                        signedCookies: true
                    });
                    createYear(req, res, db, ID);
                    if (admin) {
                        res.redirect('/org/app');
                    } else {
                        res.redirect('/app');
                        db.close;
                    }
                }
            })
        })
        
        function createYear(req, res, db, ID) {
        let mongo = require('mongodb');
        let date = new Date,
            m = date.getMonth(),
            y = date.getFullYear(),
            countMounth = m;
        console.log('Iserted id: ' + ID);

        for (let i = 0; i < 12; i++) {
            for (let mon = date.getDate(); mon <= countDays(countMounth); mon++) {
                db.collection('day').insertOne({
                    'author': ID,
                    'year': y,
                    'month': countMounth,
                    'day': mon,
                    'tasks': []
                }, function (err, res) {
                    if (err) console.log(err);
                })
            }
            if (countMounth < 11) {
                countMounth++;
            } else if (countMounth == 11) {
                countMounth = 0;
            } else {
                countMounth++;
            }
        }
    }
        function countDays(mounth) {
        if ((mounth == 3) || (mounth == 5) || (mounth == 8) || (mounth == 10)) {
            return 30;
        } else if (mounth == 1) {
            return 28;
        } else {
            return 31;
        }
    }
    }

   

   

    checkuser(query, res, mg) {
        mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
            db.collection('users').findOne(query, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    res.cookie('token', user._id, {
                        httpOnly: false,
                        signedCookies: true
                    });
                    if (user.admin == 'true') {
                        res.redirect('/org/app');
                    } else {
                        res.redirect('/app');
                    }
                    db.close;
                }
            })
        })
    }

}

module.exports = my_functions;
