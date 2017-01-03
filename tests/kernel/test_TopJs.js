/*
 * TopJs Framework (http://www.topjs.org/)
 *
 * @link      http://github.com/qcoreteam/topjs for the canonical source repository
 * @copyright Copyright (c) 2016-2017 QCoreTeam (http://www.qcoreteam.org)
 * @license   http://www.topjs.org/license/new-bsd New BSD License
 */

let assert = require("chai").assert;

const StandardLoader = require("../../lib/Entry").StandardLoader;
before(function(){
   let loader = new StandardLoader({
      [StandardLoader.AUTO_REGISTER_TOPJS] : true
   });
   loader.register();
});
describe("TopJs名称空间函数测试",function(){
   describe("TopJs.global", function(){
      it("返回全局对象", function(){
         assert.equal(TopJs.global, (function(){return this}).call());
      });
   });
   
   describe("TopJs.apply", function(){
      let origin;
      let obj;
      beforeEach(function(){
         origin = {
            name: "value",
            something: "cool",
            items: [1,2,3],
            method: function() {
               this.myMethodCalled = true;
            },
            toString: function() {
               this.myToStringCalled = true;
            }
         };
      });
      
      it("复制普通的对象字段", function(){
         TopJs.apply(origin, {
            name : "newValue",
            items : [5,6,7],
            otherThing: "not ok",
            isGood: true
         });
         assert.equal(origin.name, "newValue");
         assert.deepEqual(origin.items, [5,6,7]);
         assert.equal(origin.something, "cool");
         assert.equal(origin.otherThing, "not ok");
         assert.equal(origin.isGood, true);
      });

      it("复制函数", function(){
         TopJs.apply(origin,{
            method: function()
            {
               this.newMethodCalled = true;
            }
         });
         origin.method();
         assert.isUndefined(origin.myMethodCalled);
         assert.equal(origin.newMethodCalled, true);
      });
      
      it("复制不可枚举的字段", function(){
         TopJs.apply(origin, {
            toString()
            {
               this.newToStringCalled = true;
            }
         });
         origin.toString();
         assert.isUndefined(origin.myToStringCalled);
         assert.equal(origin.newToStringCalled, true);
      });
      
      it("复制并且返回结果对象", function(){
         obj = TopJs.apply({}, {
            prop1: 1,
            prop2: 2
         });
         assert.equal(obj.prop1, 1);
         assert.equal(obj.prop2, 2);
      });
      
      it("复制改变原有对象的引用", function(){
         obj = {};
         TopJs.apply(obj, {
            prop1: "x",
            prop2: "y"
         });

         assert.deepEqual(obj, {
            prop1: "x",
            prop2: "y"
         });
      });
      
      it("重写目标对象的字段", function(){
         obj = TopJs.apply({
            a: 1,
            b: 2
         }, {
            b: 3,
            c: 4
         });
         assert.deepEqual(obj, {
            a: 1,
            b: 3,
            c: 4
         });
      });
      
      it("使用默认对象", function(){
         obj = {};
         TopJs.apply(obj, {
            a: 1,
            b: 2
         },{
            d: 5,
            a: 3
         });
         assert.deepEqual(obj, {
            a: 1,
            b: 2,
            d: 5
         });
      });
      
      it("覆盖所有的默认属性", function(){
         obj = TopJs.apply({}, {
            name: "TopJs",
            age: 3
         },{
            name: "defaultName",
            age: 1
         });
         assert.deepEqual(obj, {
            name: "TopJs",
            age: 3
         });
      });
      
      it("第一个参数为null则返回null", function(){
         assert.isNull(TopJs.apply(null, {}));
      });
      
      it("第二参数为null则，则返回第一对象", function(){
         obj = {
            prop1: 1
         };
         assert.deepEqual(TopJs.apply(obj), obj);
      });
      
      it("覆盖valueOf函数", function(){
         obj = TopJs.apply({}, {
            valueOf: 1
         });
         assert.equal(obj.valueOf, 1);
      });
      
      it("覆盖toString函数", function(){
         obj = TopJs.apply({}, {
            toString: "topjs"
         });
         assert.equal(obj.toString, "topjs");
      });
   });
   
   describe("TopJs.emptyFn",function(){
      it("返回undefined", function(){
         assert.isUndefined(TopJs.emptyFn());
      });
      it("就算传参数返回也是undefined", function(){
         assert.isUndefined(TopJs.emptyFn("arg1", "arg2"));
      });
   });
   
   
   describe("TopJs.applyIf", function(){
      let obj;
      it("目标对象为空，返回所有被复制的属性", function(){
         obj = TopJs.applyIf({}, {
            prop1: "prop1",
            prop2: "prop2"
         });
         assert.deepEqual(obj, {
            prop1: "prop1",
            prop2: "prop2"
         });
      });
      
      it("不能覆盖目标对象已有的属性", function(){
         obj = TopJs.applyIf({
            prop1: "prop1"
         },{
            prop1: "prop2"
         });
         assert.equal(obj.prop1, "prop1");
      });
      
      it("混合复制的时候，不能覆盖目标对象的属性", function(){
         obj = TopJs.applyIf({
            prop1: "prop1",
            prop2: "prop2",
            prop3: "prop3"
         }, {
            prop2: "prop4",
            prop3: "xxx",
            prop4: "haha"
         });
         assert.deepEqual(obj,{
            prop1: "prop1",
            prop2: "prop2",
            prop3: "prop3",
            prop4: "haha"
         });
      });
      
      it("应该改变对象的引用", function(){
         obj = {};
         TopJs.applyIf(obj, {
            prop1: "prop1"
         },{
            prop1: "xxxx"
         });
         assert.equal(obj.prop1, "prop1");
      });
      
      it("如果第一个参数为null，返回null", function(){
         assert.isNull(TopJs.applyIf(null, {
            prop1: "prop1"
         }));
      });
      
      it("返回第一个参数，如果第二个参数没有提供", function(){
         obj = {
            prop1: "prop1"
         };
         assert.deepEqual(TopJs.applyIf(obj), obj);
      });
   });
   
   describe("TopJs.ensureValue", function(){
      let value;
      let defaultValue;
      describe("空字符串不为空", function(){
         it("返回空字符串", function(){
            assert.equal(TopJs.ensureValue("", "arg2", true), "")
         });
         
         it("返回第一个参数值", function(){
            assert.equal(TopJs.ensureValue("arg1", "arg2", true), "arg1");
         });
         
         it("第一个参数undefined就返回默认值", function(){
            assert.equal(TopJs.ensureValue(undefined, "arg2", true), "arg2")
         });
         
         it("0不为空，返回它", function(){
            assert.equal(TopJs.ensureValue(0, "arg2", true), 0)
         });
      });
      
      describe("空字符串不为空", function(){
         it("返回空字符串", function(){
            assert.equal(TopJs.ensureValue("", "arg2"), "arg2")
         });

         it("返回第一个参数值", function(){
            assert.equal(TopJs.ensureValue("arg1", "arg2"), "arg1");
         });

         it("第一个参数undefined就返回默认值", function(){
            assert.equal(TopJs.ensureValue(undefined, "arg2"), "arg2")
         });

         it("0不为空，返回它", function(){
            assert.equal(TopJs.ensureValue(0, "arg2"), 0)
         });
      });
   });
   
   describe("TopJs.isIterable", function(){
      let LengthyClass = function(){};
      let ClassWithItem = function(){};
      let LengthyItemClass = function(){};
      LengthyClass.prototype.length = 1;
      ClassWithItem.prototype.item = function(){};
      LengthyItemClass.prototype.length = 1;
      LengthyItemClass.prototype.item = function(){};
      
      it("函数的argumets对象可遍历", function(){
         assert.equal(TopJs.isIterable(arguments), true);
      });
      
      it("数组是可遍历", function(){
         assert.equal(TopJs.isIterable([]), true);
      });
      
      it("有数据的数据也是可遍历", function(){
         assert.equal(TopJs.isIterable([1, 2, 3, 4]), true);
      });
      
      it("布尔值false不可遍历", function(){
         assert.equal(TopJs.isIterable(false), false);
      });
      
      it("布尔值true不可遍历", function(){
         assert.equal(TopJs.isIterable(true), false);
      });

      it("字符串不可遍历", function(){
         assert.equal(TopJs.isIterable("a string value"), false);
      });
      
      it("空字符串不可遍历", function(){
         assert.equal(TopJs.isIterable(""), false);
      });
      
      it("null不可遍历", function(){
         assert.equal(TopJs.isIterable(null), false);
      });
      
      it("undefined不可遍历", function(){
         assert.equal(TopJs.isIterable(undefined), false);
      });
      
      it("date不可遍历", function(){
         assert.equal(TopJs.isIterable(new Date()), false);
      });
      
      it("空对象不可遍历", function(){
         assert.equal(TopJs.isIterable({}), false);
      });
      
      it("函数不可遍历", function(){
         assert.equal(TopJs.isIterable(function(){}), false);
      });
      
      it("具有length属相的对象不可遍历", function(){
         assert.equal(TopJs.isIterable({length: 1}), false);
      });
      
      it("具有item属性的对象不可遍历", function(){
         assert.equal(TopJs.isIterable({item: function(){}}), false);
      });
      
      it("原型具有length属性的对象不可遍历", function(){
         assert.equal(TopJs.isIterable(new LengthyClass()), false);
      });
      
      it("原型具有item属性的对象不可遍历", function(){
         assert.equal(TopJs.isIterable(new ClassWithItem()), false);
      });
      
      it("原型具有item和length属性的对象不可遍历", function(){
         assert.equal(TopJs.isIterable(new LengthyItemClass()), false);
      })
   });
   
   describe("TopJs.isArray", function(){
      it("空数组返回true", function(){
         assert.equal(TopJs.isArray([]), true);
      });
      
      it("有内容的数组返回true", function(){
         assert.equal(TopJs.isArray([1, 2, 3, 4]), true);
      });
      
      it("布尔值true不是数组", function(){
         assert.equal(TopJs.isArray(true), false);
      });

      it("布尔值false不是数组", function(){
         assert.equal(TopJs.isArray(false), false);
      });

      it("数值类型不是数组", function(){
         assert.equal(TopJs.isArray(1), false);
      });

      it("字符串类型不是数组", function(){
         assert.equal(TopJs.isArray("asdasda"), false);
      });

      it("null不是数组", function(){
         assert.equal(TopJs.isArray(null), false);
      });

      it("undefined不是数组", function(){
         assert.equal(TopJs.isArray(undefined), false);
      });
      
      it("date类型不是数组", function(){
         assert.equal(TopJs.isArray(new Date()), false);
      });
      
      it("空对象不是数组", function(){
         assert.equal(TopJs.isArray({}, false));
      });
   });
});