// -------------------------------------------------------------------
var cyberJ = null;     // 地理院地図用の変数

var center_lon = 141.12384796;
var center_lat = 38.70480271;

var gpx_url = "work/Morning_Run.gpx";

var initZoom = 14; // ズームの初期値
var MinZoom  = 10;   // ズームの最小値（最も広い範囲）
var MaxZoom  = 21;  // ズームの最大値（最も狭い範囲）

var initPrecision = 8; // 座標表示の小数点以下の桁数の初期値

// *******************************************************************
function init_map() {
    // 以下の DOM の定義は，init_map() の中に入れないとだめだった。
    var container = document.getElementById('popup');
    var content   = document.getElementById('popup-content');
    var closer    = document.getElementById('popup-closer');

    var food_info = document.getElementById('food_info');

    var style = {
        'Point': new ol.style.Style({ image: new ol.style.Circle({
            fill: new ol.style.Fill({ color: 'rgba(255,0,255,0.7)' }),
            radius: 2.5,
            stroke: new ol.style.Stroke({ color: '#0000ff', width: 2.5 })
        }) }),
        'LineString': new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#ff0000', width: 3 }) }),
        'MultiLineString': new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#ff0000', width: 3 }) })
    };

    // 表示用の view 変数の定義
    var view = new ol.View({maxZoom: MaxZoom, minZoom:MinZoom});

    // cyberJ の opacity をいじるために，cyberJ という変数に入れている。
    cyberJ = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: [ new ol.Attribution({ html: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>" }) ],
            url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",  projection: "EPSG:3857"
        })
    });

    var gpx_vector = new ol.layer.Vector({
        source:new ol.source.Vector({ url: gpx_url, format: new ol.format.GPX() }),
        style:function(feature) { return style[feature.getGeometry().getType()];}
    });

// -------------------------------------------------------------------
    // 地図をクリックした際に，停留点の情報を表示するための overlay 変数（popup 用）
    var overlay = new ol.Overlay({
        element: container
    });

    // 地図変数 (map 変数) の定義。地理院地図を表示するように指定している
    var map = new ol.Map({
        target: document.getElementById('map_canvas'),
        layers: [cyberJ, gpx_vector, markerLayer],
        view: view,
        overlays: [overlay],
        renderer: ['canvas', 'dom'],
        controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
        interactions: ol.interaction.defaults()
    });

    function displayFeatureInfo(pixel, coordinate) {
        var features = [];
        map.forEachFeatureAtPixel(pixel, function(feature, wp_layer) {
            features.push(feature);
        });
        if (features.length > 0) {
            var info = [];
            info.push('<div id="wp_desc" style="font-size:12px; width:215px">'+
              '<div id="name">フード：' + features[0].get('name') + "</div>"
              + '<div id="like">いいね：' + features[0].get('like')+'</div>'
              // + '<div id="time">' + features[0].get('time')+'</div>'
              + '<div id="img"><a href=' + features[0].get('href') + ' target="_blank"><img src="' + features[0].get('img')+'"></a></div>'
              +'</div>');

              console.log(features[0]);
            overlay.setPosition(coordinate);
            content.innerHTML = info[0];
            // food_info.innerHTML = info[0];
//            content.innerHTML = info.join('<br>') || '(unknown)';
            container.style.display = 'block';
        } else {
            content.innerHTML = '';
            container.style.display = 'none';
        }
    };

    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel, evt.coordinate);
    });

// マーカー上でアイコンの表示を変更するイベントハンドラー, jQuery が必要
    $(map.getViewport()).on('mousemove', function(e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) { return true; });
        if (hit) { map.getTarget().style.cursor = 'pointer'; }
            else { map.getTarget().style.cursor = ''; }
    });

// popup を閉じるためのイベントハンドラー
    closer.onclick = function() {
        container.style.display = 'none';
        closer.blur();
        return false;
    };

    // 地図をクリックした際に，座標を書き出す。小数点以下の桁数は initPrecision で指定。メルカトル座標 (EPSG:3857) を WGS84 (EPSG:4326) に変換している。
    map.on('click', function(evt) {
      var coordinate = evt.coordinate;
      var stringifyFunc = ol.coordinate.createStringXY(initPrecision);
      var outstr = stringifyFunc(ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326"));
      document.getElementById('outStr').innerHTML = outstr;
    });

// zoom slider の追加
    map.addControl(new ol.control.ZoomSlider());

// 中心の指定。view に対して指定。transform を忘れないこと。
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));

// zoom の指定。view に対して指定する。
    view.setZoom(initZoom);

    if(selected) {
      console.log(selected);
      overlay.setPosition([15710460.72202236, 4678858.59807794]);
      content.innerHTML = '<div id="wp_desc" style="font-size:12px; width:215px">'+
        '<div id="name">フード：' + selected['name'] + "</div>"
        + '<div id="like">いいね：' + selected['like']+'</div>'
        // + '<div id="time">' + features[0].get('time')+'</div>'
        + '<div id="img"><a href=' + selected['href'] + ' target="_blank"><img src="' + selected['img']+'"></a></div>'
        +'</div>';
      container.style.display = 'block';
    }

}
