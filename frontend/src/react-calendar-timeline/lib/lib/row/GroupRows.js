"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _GroupRow = _interopRequireDefault(require("./GroupRow"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GroupRows = /*#__PURE__*/function (_Component) {
  _inherits(GroupRows, _Component);

  var _super = _createSuper(GroupRows);

  function GroupRows() {
    _classCallCheck(this, GroupRows);

    return _super.apply(this, arguments);
  }

  _createClass(GroupRows, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      return !(nextProps.canvasWidth === this.props.canvasWidth && nextProps.lineCount === this.props.lineCount && nextProps.groupHeights === this.props.groupHeights && nextProps.groups === this.props.groups);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          canvasWidth = _this$props.canvasWidth,
          lineCount = _this$props.lineCount,
          groupHeights = _this$props.groupHeights,
          onRowClick = _this$props.onRowClick,
          onRowDoubleClick = _this$props.onRowDoubleClick,
          clickTolerance = _this$props.clickTolerance,
          groups = _this$props.groups,
          horizontalLineClassNamesForGroup = _this$props.horizontalLineClassNamesForGroup,
          onRowContextClick = _this$props.onRowContextClick;
      var lines = [];

      var _loop = function _loop(i) {
        lines.push( /*#__PURE__*/_react["default"].createElement(_GroupRow["default"], {
          clickTolerance: clickTolerance,
          onContextMenu: function onContextMenu(evt) {
            return onRowContextClick(evt, i);
          },
          onClick: function onClick(evt) {
            return onRowClick(evt, i);
          },
          onDoubleClick: function onDoubleClick(evt) {
            return onRowDoubleClick(evt, i);
          },
          key: "horizontal-line-".concat(i),
          isEvenRow: i % 2 === 0,
          group: groups[i],
          horizontalLineClassNamesForGroup: horizontalLineClassNamesForGroup,
          style: {
            width: "".concat(canvasWidth, "px"),
            height: "".concat(groupHeights[i], "px")
          }
        }));
      };

      for (var i = 0; i < lineCount; i++) {
        _loop(i);
      }

      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "rct-horizontal-lines"
      }, lines);
    }
  }]);

  return GroupRows;
}(_react.Component);

exports["default"] = GroupRows;

_defineProperty(GroupRows, "propTypes", {
  canvasWidth: _propTypes["default"].number.isRequired,
  lineCount: _propTypes["default"].number.isRequired,
  groupHeights: _propTypes["default"].array.isRequired,
  onRowClick: _propTypes["default"].func.isRequired,
  onRowDoubleClick: _propTypes["default"].func.isRequired,
  clickTolerance: _propTypes["default"].number.isRequired,
  groups: _propTypes["default"].array.isRequired,
  horizontalLineClassNamesForGroup: _propTypes["default"].func,
  onRowContextClick: _propTypes["default"].func.isRequired
});