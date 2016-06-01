var fs = require('fs');
var async = require("async");

var options = require('../../options');

var friendlyFile = function (id, range) {
  var leng = id.length;
  var nextNum;
  var nextNumLength;
  if (range == '-') {
    nextNum = parseInt(id) - 1;
  } else {
    nextNum = parseInt(id) + 1;
  }
  nextNumLength = nextNum.toString().length;

  return id.substring(0, leng - nextNumLength) + nextNum.toString();
};

module.exports = function (farmeId, callback) {
  async.waterfall([
    function(next) {
      var html = '';
      var prewFile = friendlyFile(farmeId, '-');
      var nextFile = friendlyFile(farmeId);
      if (fs.existsSync(options.DATA_ROOT + options.FRAMES_FOLDER + prewFile  + '.jpg')) {
        html += '<a href="/' + prewFile + '"><<< PREW</a>&nbsp;&nbsp;';
      }
      if (fs.existsSync(options.DATA_ROOT + options.FRAMES_FOLDER + nextFile  + '.jpg')) {
        html += '&nbsp;&nbsp;<a href="/' + nextFile + '">NEXT >>></a>';
      }
      try {
        fs.readFile(
          options.DATA_ROOT + options.FRAMES_FOLDER + farmeId + '.jpg',
          function(err, data) {
            if (err) {
              html += '<div style="color: red; font-size: 16px; font-weight: bold;">Отсутствует кадр</div>';
            } else {
              html += '<div style="position: relative;"><div><img src="data:image/jpeg;base64,' + new Buffer(data).toString('base64') + '"></div>';
            }
            next(null, html);
          }
        );
      } catch (e) {
        next(e, html);
      }
    },
    function (html, next) {
      // next(null, html + '<b>sss</b>');
      try {
        fs.readFile(
          options.DATA_ROOT + options.FRAMES_META_FOLDER + farmeId + '.json',
          function (err, data) {
            if (err) {
              html += '<div style="color: red; font-size: 16px; font-weight: bold;">Отсутствует файл данных</div>';
              next(null, html);
            } else {
              var parseData = JSON.parse(data);
              var HTML2 = '';
              HTML2 += '<div><b>Frame: </b>' + parseData.name + '</div><br>';
              HTML2 += '<div><b>Objects:</b></div><table><thead><tr><td>Obj ID</td><td>Start frame</td><td>Last frame</td></tr></thead><tbody>';
              var fileList = [];
              var objData;
              var frameTop;
              var frameLeft;
              var frameWidth;
              var frameHeight;
              for (var obj in parseData.objs) {
                objData = parseData.objs[obj];
                fileList.push(obj);
                frameTop = objData.pos.top;
                frameLeft = objData.pos.left;
                frameWidth = objData.pos.right - objData.pos.left;
                frameHeight = objData.pos.bottom - objData.pos.top;
                html += '<div style="position: absolute; width: ' + frameWidth + 'px; height: ' + frameHeight + 'px; top: ' + frameTop + 'px; left: ' + frameLeft + 'px; border: 1px solid red; background-color: transparent;">';
                html += '</div>';
              }
              html += '</div>';
              async.each(
                fileList,
                function (fileId, next) {
                  try {
                    fs.readFile(
                      options.DATA_ROOT + options.OBJECTS_META_FOLDER + fileId + '.json',
                      function (err, data) {
                        if (err) {
                          HTML2 += '<tr><td colspan="3"><i>Нет данных по объекту</i></td></tr>';
                        } else {
                          var parseData = JSON.parse(data);
                          HTML2 += '<tr><td>' + fileId + '</td>';
                          HTML2 += '<td><a href="/' + parseData.start_frame + '">' + parseData.start_frame + '</a></td>';
                          HTML2 += '<td><a href="/' + parseData.last_frame + '">' + parseData.last_frame + '</td></tr>';
                        }
                        next(null);
                      }
                    );
                  } catch (e) {
                    HTML2 += '<tr><td colspan="3"><i>Нет данных по объекту</i></td></tr>';
                    next(null);
                  }
                },
                function (err) {
                  HTML2 += '</tbody></table>';
                  next(null, html + HTML2);
                }
              );
            }
          }
        );

      } catch (e) {
        next(e, html);
      }
    }
  ], function (err, html) {
    callback(html);
  });
}
