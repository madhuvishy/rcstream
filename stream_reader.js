var io = require( 'socket.io-client' );
var socket = io.connect( 'stream.wikimedia.org/rc' );
var request = require('request');

var template = 
	{ comment: '',
	  wiki: '',
	  server_name: '',
	  title: '',
	  timestamp: 0,
	  server_script_path: '',
	  namespace: 0,
	  server_url: '',
	  length: { new: 0, old: 0 },
	  user: '',
	  bot: false,
	  type: 'edit',
	  id: 0,
	  minor: false,
	  patrolled: false,
	  revision: { new: 0, old: 0 } 
	};

socket.on( 'connect', function () {
    socket.emit( 'subscribe', 'en.wikipedia.org' );
} );

socket.on( 'change', function ( data ) {
	
	if(data.type === 'edit'){
		var result = {};
		for(var key in template) result[key] = template[key];
		for(var key in data) result[key]=data[key];
		console.log(JSON.stringify(result));
		request({
			method: "POST",
			uri: "http://kafka-rest.wmflabs.org/topics/rc-events-new",
			headers: {
				"Content-Type": "application/vnd.kafka.avro.v1+json"
			},
			data: {
				"value_schema_id": 48,
				"records": [
					{"value": 
						{"comment":"","wiki":"enwiki","server_name":"en.wikipedia.org","title":"Mad Max","timestamp":1437006823,"server_script_path":"/w","namespace":0,"server_url":"https://en.wikipedia.org","length":{"new":33237,"old":33281},"user":"Kibgzr","bot":false,"type":"edit","id":749523920,"minor":false,"patrolled":false,"revision":{"new":671633998,"old":671364842}}
					}
				]
			}	
		},
		function(err,httpResponse,body){ 
			//console.log(err);
			//console.log(httpResponse);
			console.log(body);
		});		
	}
} );

/*
curl -X POST -H "Content-Type: application/vnd.kafka.avro.v1+json" \
    --data "{\"value_schema_id\": 48, \"records\":
        [
            {\"value\": $(cat ./rcevent.json)}
        ]
    }" \
    http://kafka-rest.wmflabs.org/topics/rc-events-new



curl -X POST -H "Content-Type: application/vnd.kafka.avro.v1+json" \
    --data '{"value_schema_id": 48, "records":
        [
            {"value": $(cat ./rcevent.json)}
        ]
    }' \
    http://kafka-rest.wmflabs.org/topics/rc-events-new
   */