const ApiBuilder = require('claudia-api-builder');
const AWS = require('aws-sdk');
const api = new ApiBuilder();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid4');

const TableName = 'Albums';

// Create an album
api.post('/albums', req => {
    const params = {
        TableName,
        Item: {
            albumId: uuid(),
            albumName: req.body.albumName,
            photoList: req.body.photoList
        }
    };

    return dynamoDb.put(params).promise()
        .then(res => params.Item);
}, { success: 201 });

// Get all albums
api.get('/albums', req => {
    return dynamoDb.scan({ TableName }).promise()
        .then(res => res.Items);
});

// Get an album by id
api.get('/albums/{albumId}', req => {
    const albumId = req.pathParams.albumId;

    const params = {
        TableName,
        KeyConditionExpression: 'albumId = :i',
        ExpressionAttributeValues: {
            ':i': albumId
        }
    };

    return dynamoDb.query(params).promise()
        .then(res => res.Items[0]);
});

// Update an album by id
api.put('albums/{albumId}', req => {
    const albumId = req.pathParams.albumId;

    const params = {
        TableName,
        Key: { albumId },
        UpdateExpression: 'set albumName = :n, photoList = :p',
        ExpressionAttributeValues: {
            ':n': req.body.albumName,
            ':p': req.body.photoList
        },
        ReturnValues: "ALL_NEW"
    };

    return dynamoDb.update(params).promise()
        .then(data => data.Attributes);
});

module.exports = api;
