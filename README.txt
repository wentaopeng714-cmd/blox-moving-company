摇摇搬家队 — 独立移动版

本文件夹可以单独部署或导入，不依赖另一个游戏。
只包含本游戏的关卡与规则，最佳纪录也独立保存。

玩法：摇杆推车和转向，按住右侧按钮减速扶稳，停在绿色交付圈内自动卸货。

三条路线，支持手机竖屏与横屏。右上角菜单选关或回检查点。
电脑支持WASD、空格与R键。

本地运行：在本文件夹执行 npm start，打开 http://localhost:4182/ 。
也可以通过任意静态网页服务器提供本文件夹。请通过HTTP打开，不要直接双击index.html。

index.html 为入口；main.js 为画面和交互；engine.js 为本游戏的规则；art.js 为通用3D美术工具。
Three.js已放在vendor中，许可见vendor/THREE-LICENSE.txt。

Painted toon update: explicit light bands, hue-rich colored shadows, vivid blocks and plum silhouette outlines. Mobile controls remain supported.
