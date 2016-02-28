var assert = require('assert');
var jsan = require('rek')('');

describe('jsan', function() {
    describe('has a stringify method', function() {
    it('behaves the same as JSON.stringify for simple jsonable objects', function() {
      var obj = {
        a: 1,
        b: 'string',
        c: [2,3],
        d: null
      };
      assert.equal(JSON.stringify(obj), jsan.stringify(obj));
    });

    it('can handle dates', function() {
      var obj = {
        now: new Date()
      }
      var str = jsan.stringify(obj, null, null, true);
      assert(/^\{"now":\{"\$jsan":"d[^"]*"\}\}$/.test(str));
    });

    it('works on objects with circular references', function() {
      var obj = {};
      obj['self'] = obj;
      assert.equal(jsan.stringify(obj), '{"self":{"$jsan":"$"}}');
    });

    it('works on objects with "[", "\'", and "]" in the keys', function() {
      var obj = {};
      obj['["key"]'] = {};
      obj['["key"]']['["key"]'] = obj['["key"]'];
      assert.equal(jsan.stringify(obj), '{"[\\"key\\"]":{"[\\"key\\"]":{"$jsan":"$[\\"[\\\\\\"key\\\\\\"]\\"]"}}}');
    });

    it('works on objects that will get encoded with \\uXXXX', function() {
      var obj = {"\u017d\u010d":{},"kraj":"\u017du\u017e"};
      obj["\u017d\u010d"]["\u017d\u010d"] = obj["\u017d\u010d"];
      assert.equal(jsan.stringify(obj), '{"\u017d\u010d":{"\u017d\u010d":{"$jsan":"$[\\\"\u017d\u010d\\\"]"}},"kraj":"Žuž"}');
    });

    it('works on circular arrays', function() {
      var obj = [];
      obj[0] = [];
      obj[0][0] = obj[0];
      assert.equal(jsan.stringify(obj), '[[{"$jsan":"$[0]"}]]');
    });

  });



  describe('has a parse method', function() {
    it('behaves the same as JSON.parse for valid json strings', function() {
      var str = '{"a":1,"b":"string","c":[2,3],"d":null}';
      assert.deepEqual(JSON.parse(str), jsan.parse(str));
    });

    it('can decode dates', function() {
      var str = '{"now":{"$jsan":"d1400000000000"}}';
      var obj = jsan.parse(str);
      assert(obj.now instanceof Date);
    });

    it('works on object strings with a circular dereferences', function() {
      var str = '{"a":1,"b":"string","c":[2,3],"d":null,"self":{"$jsan":"$"}}';
      var obj = jsan.parse(str);
      assert(obj['self'] === obj);
    });

    it('works on object strings with "[", "\'", and "]" in the keys', function() {
      var str = '{"[\\"key\\"]":{"[\\"key\\"]":{"$jsan":"$[\\"[\\\\\\"key\\\\\\"]\\"]"}}}';
      var obj = jsan.parse(str);
      assert(obj['["key"]']['["key"]'] === obj['["key"]']);
    });

    it('works on objects encoded with \\uXXXX', function() {
      var str = '{"\u017d\u010d":{"\u017d\u010d":{"$jsan":"$[\\\"\\u017d\\u010d\\\"]"}},"kraj":"Žuž"}';
      var obj = jsan.parse(str);
      assert(obj["\u017d\u010d"]["\u017d\u010d"] === obj["\u017d\u010d"]);
    });

    it('works on array strings with circular dereferences', function() {
      var str = '[[{"$jsan":"$[0]"}]]';
      var arr = jsan.parse(str);
      assert(arr[0][0] === arr[0]);
    });
  });

});
