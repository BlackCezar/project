"use strict";
let mongo = require('mongodb'),
    myFunc = require('./functions'),
    func = new myFunc();
function router(app, mg) {


    app.get('/forme', (req, res) => {
        (func.checkacces(req, res)) ? res.render('index', {
                title: "Главная страница",
                auth: true
            }):
            res.render('index', {
                title: "Главная страница",
                auth: false
            });
    })
    app.get('/', (req, res) => {
        res.render('choose');
    });
    app.post('/forme', (req, res) => {
        func.checkuser(req.body, res, mg);
    })
    app.get('/fororg', (req, res) => {
        (func.checkacces(req, res)) ? res.render('index2', {
                title: "Главная страница",
                auth: true
            }):
            res.render('index2', {
                title: "Главная страница",
                auth: false
            });
    })
    app.get('/create_org', (req,res)=> {
        res.render('org/create_org', {title: "Создание организаци"});
    })
    app.post('/fororg', (req, res) => {
        func.checkuser(req.body, res, mg);
    })
    app.get('/reg', (req, res) => {
        if (func.checkacces(req, res)) {
            res.redirect('/');
        } else {
            res.clearCookie('token');
            res.render('reg', {
                title: "Регистрация",
                auth: false
            });
        }
    })
    app.post('/reg', (req, res) => {
        func.insertuser(req, res, mg);
    })

    app.get('/org/reg', (req, res) => {
        if (func.checkacces(req, res)) {
            res.redirect('/fororg');
        } else {
            res.clearCookie('token');
            res.render('org/reg', {
                title: "Регистрация организации",
                auth: false
            });
        }
    })
    app.post('/org/reg', (req, res) => {
        func.insertuser(req, res, mg, 'admin');
    })

    app.get('/authh', (req, res) => {
        if (func.checkacces(req, res)) {
            res.redirect('/');
        } else {
            res.clearCookie('token');
            res.render('auth', {
                title: "Авторизация",
                auth: false
            });
        }
    })
    app.post('/authh', (req, res) => {
        func.checkuser(req.body, res, mg);
    })

    app.get('/logout', (req, res) => {
        res.clearCookie('token');
        res.redirect('/');
    })

    app.get('/app', (req, res) => {
        if (func.checkacces(req, res)) {
            mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
                let Id = mongo.ObjectId(req.cookies.token);
                db.collection('users').findOne({
                    '_id': Id
                }, function (err, user) {
                    db.collection('day').find({
                        'author': Id
                    }, {
                        limit: 7
                    }).toArray(function (err, resull) {
                        let ress = JSON.stringify(resull);
                        ress = JSON.parse(ress);
                        console.log(ress[1].tasks);
                        res.render('app/app', {
                            title: 'Задачи',
                            user: user,
                            user_days: ress
                        });
                    });
                });
            });

        } else {
            res.clearCookie('token');
            res.redirect('/authh');
        }
    });

  app.get('/org/app', (req, res) => {
        if (func.checkacces(req, res)) {
            mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
                let Id = mongo.ObjectID(req.cookies.token);
                db.collection('users').findOne({
                    '_id': Id
                }, function (err, user) {
                    let day = (new Date()).getDate();
                    let month = (new Date()).getMonth();
                    let year = (new Date()).getFullYear();
                    db.collection('day').find({
                        'author': Id,
                        'year': year,
                        'month': month,
                        $or: [
                            { 'day': day },
                            { 'day': day + 1 },
                            { 'day': day + 2},
                            { 'day': day + 3},
                            { 'day': day + 4},
                            { 'day': day + 5},
                            { 'day': day + 6}
                        ]
                    }, {
                        limit: 7
                    }).toArray(function (err, resull) {
                        let ress = JSON.stringify(resull);
                        ress = JSON.parse(ress);
                        console.log(ress);
                        res.render('org/app', {
                            title: 'Задачи',
                            user: user,
                            user_days: ress
                        });
                    });
                });
            });

        } else {
            res.clearCookie('token');
            res.redirect('/authh');
        }
    })
app.get('/org/app/:id', (req, res) => {
    mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
        let Id = mongo.ObjectID(req.cookies.token);
        let param = mongo.ObjectID(req.params.id);
        db.collection('users').findOne({
            '_id': Id
        }, function (err, user) {
            db.collection('day').findOne({
                '_id': param
            }, function (err, resull) {
                res.json(resull);
                });
            });
        });
    });
    app.get('/app/:id', (req, res) => {
        if (func.checkacces(req, res)) {

            mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
                let Id = mongo.ObjectID(req.cookies.token);
                let param = mongo.ObjectID(req.params.id);
                db.collection('users').findOne({
                    '_id': Id
                }, function (err, user) {
                    db.collection('day').findOne({
                        '_id': param
                    }, function (err, resull) {
                        console.log(resull);
                        res.render('app/task', {
                            title: 'Задачи',
                            user: user,
                            task: resull
                        });
                    });
                });
            });
        } else {
            res.clearCookie('token');
            res.redirect('/');
        }
    })
    app.post('/app/:id', (req, res) => {
        console.log(req.params);
        mg.connect('mongodb://localhost:27017/mydb', (err, db) => {

            let param = mongo.ObjectID(req.params.id);
            let day_id = req.params;
            let day_msg = req.body.msg;
            db.collection('day').findOne({
                '_id': param
            }, function (err, task) {
                db.collection('tasks').insertOne({
                    day: day_id.id,
                    msg: day_msg,
                    status: 'task',
                    hours: new Date().getHours(),
                    minutes: new Date().getMinutes()
                }, function (err, inserted_task) {
                    let tt = task.tasks;
                    tt.push({
                        'task': inserted_task.ops[0],
                        task_number: tt.length + 1
                    });
                    console.log(tt[0].task);
                    db.collection('day').update({
                        '_id': param
                    }, {
                        $set: {
                            tasks: tt
                        }
                    }, function (err, resull) {
                        if (err) {
                            console.log(err);
                        }
                        console.log('inserted task ');
                        res.json({
                            task: inserted_task.ops[0],
                            number: tt.length
                        });
                    });
                });
            })
        });
    });
    app.post('/org/app/:id', (req, res) => {
        console.log(req.params);
        mg.connect('mongodb://localhost:27017/mydb', (err, db) => {

            let param = mongo.ObjectID(req.params.id);
            let day_id = req.params;
            let day_msg = req.body.msg;
            db.collection('day').findOne({
                '_id': param
            }, function (err, task) {
                db.collection('tasks').insertOne({
                    day: day_id.id,
                    msg: day_msg,
                    status: 'task',
                    hours: new Date().getHours(),
                    minutes: new Date().getMinutes()
                }, function (err, inserted_task) {
                    let tt = task.tasks;
                    tt.push({
                        'task': inserted_task.ops[0],
                        task_number: tt.length + 1
                    });
                    console.log(tt[0].task);
                    db.collection('day').update({
                        '_id': param
                    }, {
                        $set: {
                            tasks: tt
                        }
                    }, function (err, resull) {
                        if (err) {
                            console.log(err);
                        }
                        console.log('inserted task ');
                        res.json({
                            task: inserted_task.ops[0],
                            number: tt.length
                        });
                    });
                });
            })
        });
    });
    app.post('/change_status', (req, res) => {
        mg.connect('mongodb://localhost:27017/mydb', (err, db) => {
            let day_id = mongo.ObjectID(req.body.day);
            db.collection('day').findOne({
                '_id': day_id
            }, (err, ress) => {
                console.log(ress.tasks);
                ress.tasks.forEach(task => {
                    if (task.task._id == req.body.id) {
                        if (req.body.st == 0) {
                            console.log(0);
                            task.task.status = 'complited';
                        } else {
                            task.task.status = 'task';
                            console.log(1);
                        }
                    }
                });
                db.collection('day').updateOne({
                    '_id': day_id
                }, ress);
            });
        });
    })
}

module.exports = router;