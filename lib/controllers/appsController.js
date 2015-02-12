"use strict";

exports.create = function createApps(req, res, container) {

    var data = req.data;

    // PK 체크
    container.getService('MONGODB').then(function(service) {

        service.send('findOne', {collectionName : 'apps', query : {where : {_userid : req.session.userid, appname : data.appname}}}, function(err, doc) {

            if(err)
                return res.error(err);

            if(doc.data) {

                return res.error(new Error("Duplicated unique property error"));
            }

            data._userid = req.session.userid;
            data.applicationId = generateRandomString(32);
            data.clientKey = generateRandomString(32);
            data.javascriptKey = generateRandomString(32);
            data.dotNetKey = generateRandomString(32);
            data.restApiKey = generateRandomString(32);
            data.masterKey = generateRandomString(32);

            service.send('insert', {collectionName : 'apps', data : data}, function(err, doc) {

                if(err)
                    return res.error(err);

                res.send(201, {
                    createdAt : doc.data.createdAt,
                    objectId : doc.data.objectId,
                    applicationId : doc.data.applicationId,
                    clientKey : doc.data.clientKey,
                    javascriptKey : doc.data.javascriptKey,
                    dotNetKey : doc.data.dotNetKey,
                    restApiKey : doc.data.restApiKey,
                    masterKey : doc.data.masterKey
                });
            });
        });
    }).fail(function(err) {

        res.error(err);
    });
};

exports.update = function(req, res, container) {

    var data = req.data;

    if(!data)
        return res.error(new Error('RequestBodyNotFound'));

    container.getService('MONGODB').then(function(service) {

        service.send('update', {collectionName : 'apps', query : {where : {objectId : req.params._objectId}}, data : data}, function(err, doc) {

            if(err) {

                if(err.code === 10147)
                    return new Error(404, 'ResourceNotFound');

                return res.error(err);
            }


            res.send(200, {
                updatedAt : doc.data.updatedAt
            });

        });
    }).fail(function(err) {

        res.error(err);
    });
};

exports.read = function(req, res, container) {

    container.getService('MONGODB').then(function(service) {

        service.send('findOne', {collectionName : 'apps', query : {where : {objectId : req.params._objectId}}}, function(err, doc) {

            if(err)
                return res.error(err);

            res.send(200, doc.data);
        });
    }).fail(function(err) {

        res.error(err);
    });
};

exports.find = function(req, res, container) {

    if (req.session && req.session.userid)
        req.query.where._userid = req.session.userid;

    container.getService('MONGODB').then(function (service) {

        service.send('find', {collectionName : 'apps', query: req.query}, function (err, docs) {

            if (err)
                return res.error(err);

            if (typeof(docs.data) === 'number') {

                res.send(200, {results: [], count: docs.data});
            } else {

                res.send(200, {results: docs.data});
            }
        });
    }).fail(function (err) {

        res.error(err);
    });
};

exports.destroy = function(req, res, container) {

    container.getService('MONGODB').then(function(service) {

        service.send('remove', {collectionName : 'apps', query : {where : {objectId : req.params._objectId}}}, function(err, doc) {

            if(err)
                return res.error(err);

            res.send(200, {});
        });
    }).fail(function(err) {

        res.error(err);
    });
};

exports.destroyAll = function(req, res, container) {

    // 테스트에서만 사용
    if(process.env.NODE_ENV !== 'test') {

        return new Error("cannot access");
    }

    container.getService('MONGODB').then(function(service) {

        service.send('remove', {collectionName : 'apps', query : {}}, function(err, doc) {

            if(err)
                return res.error(err);

            res.send(200, {});
        });
    }).fail(function(err) {

        res.error(err);
    });
};

function generateRandomString(length) {

    length = length ? length : 32;

    var rdmString = "";

    for( ; rdmString.length < length; rdmString  += Math.random().toString(36).substr(2));

    return  rdmString.substr(0, length);
}