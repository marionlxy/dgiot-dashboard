import canvas from '@/utils/konva/core/canvas'
import addNodeEvent from '@/utils/konva/common'
import { parseQueryString, imgUrlToFile } from '@/utils'
import playGIF from '@/utils/file/rgif'
import { Stream } from '@/utils/file/gif'
let info = {
  tagevent: [],
  tag: [],
  evidence: [],
  badge: [],
}
let dbclickflag = false
let timer = ''
canvas.info = info
/**
 * @description 组态Stage公共函数
 * @type {{handleChildren(*=): void}}
 */
const topoStage = {
  handleChildren(args) {
    console.log(args, 'args')
    const { layer } = canvas
    info['handleArray'] = args
    const { stage } = args
    stage.find('Star').forEach((node) => {
      info['Star'] = stage.find('Star')
      node.setAttrs({
        x: 5,
        fill: 'red',
      })
      const bgSrc = node.getAttr('src').includes('//')
        ? node.getAttr('src')
        : Cookies.get('fileServer') + node.getAttr('src').includes('//')
      localStorage.setItem('konvaBg', bgSrc)
      // node.destroy()
      canvas.bgNode = node
      addNodeEvent({
        type: 'bgMoveToBottom',
        bgNode: node,
        layer: args.layer,
        stage: args.stage,
      })
    })
    stage.find('Label').forEach((node) => {
      info['Label'] = stage.find('Label')
      console.log(
        "['thing', 'amis', 'device'].indexOf(node.getAttr('name')) ",
        ['thing', 'amis', 'device'].indexOf(node.getAttr('name'))
      )
      if (
        ['thing', 'amis', 'device'].indexOf(node.getAttr('name')) != -1 ||
        location.href.includes('evidence')
      ) {
        const nodeTags = node.getChildren()
        nodeTags.forEach((tag) => {
          info['tag'].push(tag)
          if (location.href.includes('&type=device')) {
            // dgiotlogger.info('dgiotlogger node:', tag)
            tag.setAttrs({
              draggable: false,
            })
            return false
          }
          const event = tag.getAttr('name')
          node.on('mouseover', function (e) {
            document.body.style.cursor = 'pointer'
          })
          node.on('mouseout', function (e) {
            document.body.style.cursor = 'default'
          })
          node.on('contextmenu', (e) => {
            canvas.contextmenu = e.target
            console.log('contextmenu', e)
          })
          // tag.on('click', (e) => {
          //   console.log(e)
          //   canvas.clickItem = e.target
          //   canvas.contextmenu = e.target
          //   console.log('tag click', e.target.attrs)
          // })
          if (event) {
            info.tagevent.push({
              tag: tag,
              event: event,
              name: tag.getAttr('name'),
            })
            addNodeEvent({
              type: node.getAttr('name'),
              event: `${event}`,
              node: node,
            })
          }
        })
      }
    })
    stage.find('Text').forEach((node) => {
      info['Text'] = stage.find('Text')
      if (
        location.href.includes('&type=device') ||
        location.href.includes('evidence')
      ) {
        dgiotlogger.info('dgiotlogger node:', node)
        node
          ? node.setAttrs({
              draggable: false,
            })
          : ''
        node?.parent
          ? node.parent.setAttrs({
              draggable: false,
            })
          : ''
        // return false
      }
      if (node.getAttr('hidden') === true) node.hide()
      // node.setAttrs({
      //   scaleX: args.saleInfo.scaleX,
      //   scaleY: args.saleInfo.scaleY,
      // })
      node.on('contextmenu', (e) => {
        canvas.contextmenu = e.target
        canvas.clickItem = e.target
        console.log('contextmenu', e.target)
      })
      // circle.on('touchend', function() {
      //   writeMessage('Touchend circle');
      // })
      node.on('touchend', (e) => {
        if (node.getAttr('bind_amis') && node.getAttr('amis_id').length > 0)
          dgiotBus.$emit('nodeInfo', node)
      })
      /** */
      node.on('click', (e) => {
        console.log('点击弹出编辑框', e.evt.button, dbclickflag)
        //判断是否点击鼠标左键和在编辑状态
        if (dbclickflag) {
          // clearTimeout(timer)
          setTimeout(() => {
            dbclickflag = false
          }, 500)
        }
        if (!dbclickflag) {
          dbclickflag = true
          timer = setTimeout(() => {
            if (
              e.evt.button == 0 &&
              window.location.hash.indexOf('type=device') < 0
            ) {
              dbclickflag = false
              console.log('打开编辑框')
              dgiotBus.$emit('nodeEdit', node)
            }
          }, 500)
        }

        if (node.getAttr('bind_amis') && node.getAttr('amis_id').length > 0)
          dgiotBus.$emit('nodeInfo', node)
        // canvas.contextmenu = {}
        // canvas.clickItem = e.target
        // console.log('click', e.target.attrs)
        // 单击时，这里根据node bind 的控件类型，去展示对应的控件信息
      })
      node.on('dblclick', (e) => {
        if (node.getAttr('bind_amis') && node.getAttr('amis_id').length > 0)
          dgiotBus.$emit('nodeInfo', node)
      })
      node.on('mouseover', function (e) {
        document.body.style.cursor = 'pointer'
      })
      node.on('mouseout', function (e) {
        document.body.style.cursor = 'default'
      })
    })
    stage.find('Image').forEach((node, current) => {
      let imageList = []
      if (
        location.href.includes('&type=device') ||
        location.href.includes('evidence')
      ) {
        dgiotlogger.info('dgiotlogger node:', node)
        node
          ? node.setAttrs({
              draggable: false,
            })
          : ''
        node?.parent
          ? node.parent.setAttrs({
              draggable: false,
            })
          : ''
      }
      addNodeEvent({
        type: node.getAttr('name'),
        node: node,
      })
      if (node.attrs.type == 'konvaimage') {
        console.log('这是图片1111111', node)
        if (window.location.hash.indexOf('type=device') > 0) {
          imgUrlToFile(node.attrs.src).then((item) => {
            var file = item
            console.log('这是图片解析内容', item, window.FileReader)

            // let formData = new FormData()
            // formData.append('file', item)
            // console.log('file FormData', formData)
            // var jsonData = { file: '' }
            // formData.forEach((value, key) => (jsonData[key] = value))
            // console.log(jsonData)
            if (window.FileReader) {
              var fr = new FileReader()
              console.log(fr)
              // fr.readAsDataURL(item)
              // fr.onload = (e) => {
              //   console.log('e', e.target.result)
              // }
              fr.onloadend = function (e) {
                console.log(e)
                console.log('打印引入', playGIF, '打印stream', Stream)
                //document.getElementById("portrait").src = e.target.result;
                console.log('e.target.result', e, playGIF)
                playGIF.doParse(
                  new Stream(e.target.result),
                  function (hdr, frames, canvas) {
                    //console.log(hdr);
                    //console.log(frames.length);
                    //帧
                    var s = 0
                    for (var i = 0; i < frames.length; i++) {
                      s += frames[i].delay
                    }
                    //时长
                    console.log('total time:' + s * 10 + ' milliseconds')
                    //第一张图片
                    console.log('这是读取gif内容', frames)
                    if (window.location.hash.indexOf('type=device') > 0) {
                      let index = 0

                      let BgimageObj = new Image()

                      imageList[current] = setInterval(() => {
                        console.log('konvagif', index, node)
                        node.setAttrs({
                          image: BgimageObj,
                        })
                        canvas
                          .getContext('2d')
                          .putImageData(frames[index].data, 0, 0)
                        // console.log('base64', canvas.toDataURL('image/jpg'))
                        BgimageObj.src = canvas.toDataURL('image/png')
                        index++
                        if (index == frames.length) index = 0
                        if (window.location.hash.indexOf('type=device') < 0) {
                          clearInterval(imageList[current])
                        }
                      }, 500)
                    }

                    // canvas.getContext('2d').putImageData(frames[15].data, 0, 0)
                    // var img = document.getElementById('portrait')
                    // img.width = hdr.width
                    // img.height = hdr.height
                    // img.src = canvas.toDataURL('image/png')
                  }
                )
              }
              // fr.onloadend(e)
              //console.log(fr.readAsDataURL(file));
              //fr.readAsDataURL(file);
              //fr.readAsArrayBuffer(file);
              //fr.readAsBinaryString(file);
              //fr.readAsText(file);
              if (typeof fr.readAsBinaryString == 'function') {
                fr.readAsBinaryString(file)
              }
            }
          })
        } else if (window.location.hash.indexOf('type=device') < 0) {
          console.log('进行图片展示', node)
          let image = new Image()
          node.setAttrs({
            image: image,
          })
          image.src = node.attrs.src
        }
        // BgimageObj.onload = () => {
        // layer.add(yoda)
        // const BgimageObj = new Image()

        // let imgList = [
        //   'http://konvajs-doc.bluehymn.com/assets/blob-sprite.png',
        //   'http://dev.iotn2n.com/dgiot_file/topo/png/pump.gif',
        // ]

        // var angularSpeed = 90
        // let currentIndex = 0
        // let change = 0
        // var anim = new Konva.Animation(function (frame) {
        //   var angleDiff = (frame.timeDiff * angularSpeed) / 1000
        //   console.log('frame.timeDiff', frame)
        //   change++
        //   frame.frameRate = 0.1
        //   // var frameRate = 1
        //   // node.rotate(angleDiff)
        //   if (change == 20) {
        //     change = 0
        //     BgimageObj.src = imgList[Math.floor(frame.timeDiff % 2)]
        //   }
        //   node.setAttrs({
        //     image: BgimageObj,
        //   })
        // }, canvas.layer)
        // anim.start()

        // node.start()
        // node.rotate(90)
        // }
        // BgimageObj.src = bgSrc
        // layer.batchDraw()
        // stage.batchDraw()
      }
      node.on('contextmenu', (e) => {
        canvas.contextmenu = e.target
        console.log('contextmenu', e.target)
      })
      node.on('click', (e) => {
        console.log(e, 'eeeeee')
        canvas.clickItem = e.target
        canvas.contextmenu = {}
        console.log('click', e.target.attrs)
      })
    })
    stage.find('Sprite').forEach((node) => {
      if (
        location.href.includes('&type=device') ||
        location.href.includes('evidence')
      ) {
        dgiotlogger.info('dgiotlogger node:', node)
        node
          ? node.setAttrs({
              draggable: false,
            })
          : ''
        node?.parent
          ? node.parent.setAttrs({
              draggable: false,
            })
          : ''
      }
      addNodeEvent({
        type: node.getAttr('name'),
        node: node,
      })
      // if (node.attrs.type == 'gifimage') {
      console.log('这是图片1111111', node)
      const BgimageObj = new Image()
      // BgimageObj.onload = () => {
      // layer.add(yoda)
      // const BgimageObj = new Image()
      BgimageObj.src = node.attrs.src
      node.setAttrs({
        image: BgimageObj,
      })
      node.start()
      // }
      // BgimageObj.src = bgSrc
      // layer.batchDraw()
      // stage.batchDraw()
      // }
      node.on('contextmenu', (e) => {
        canvas.contextmenu = e.target
        console.log('contextmenu', e.target)
      })
      /** */
      node.on('click', (e) => {
        console.log('点击弹出编辑框', e.evt.button, dbclickflag)
        //判断是否点击鼠标左键和在编辑状态
        if (dbclickflag) {
          // clearTimeout(timer)
          setTimeout(() => {
            dbclickflag = false
          }, 500)
        }
        if (!dbclickflag) {
          dbclickflag = true
          timer = setTimeout(() => {
            if (
              e.evt.button == 0 &&
              window.location.hash.indexOf('type=device') < 0
            ) {
              dbclickflag = false
              console.log('打开编辑框')
              dgiotBus.$emit('nodeEdit', node)
            }
          }, 500)
        }
        // canvas.contextmenu = {}
        // canvas.clickItem = e.target
        // console.log('click', e.target.attrs)
        // 单击时，这里根据node bind 的控件类型，去展示对应的控件信息
      })
    })
    stage.find('Path').forEach((node) => {
      info['Path'] = stage.find('Path')
      info['evidence'].push(node)
      addNodeEvent({
        type: node.getAttr('name'),
        node: node,
      })
      if (['evidence', 'thing', 'device'].indexOf(node.getAttr('name')) != -1) {
        if (
          location.href.includes('preview') ||
          location.href.includes('&type=device')
        ) {
          node.setAttrs({
            draggable: false,
          })
          const urlObj = new parseQueryString(location.href)
          if (urlObj.step == 3)
            node.setAttrs({
              fill: 'yellow',
            })
          return false
        }

        // canvas.layer.batchDraw()
        // canvas.stage.batchDraw()
      }
      // node.setAttrs({
      //   scaleX: args.saleInfo.scaleX,
      //   scaleY: args.saleInfo.scaleY,
      // })
      // 定义事件监听
      // node.on('mouseover', function(e) {
      //   console.log('鼠标mouseover')
      //   layer.draw()
      // })
      // node.on('mouseout', function() {
      //   console.log('鼠标mouseout')
      //   layer.draw()
      // })
      // node.on('mousedown', function(e){
      //   console.log('mousedown',e)
      //   layer.draw()
      // })
      // node.on('mouseup', function(e) {
      //   console.log('鼠标移出星',e)
      //   layer.draw()
      // })
      node.on('contextmenu', (e) => {
        canvas.contextmenu = e.target
        console.log('contextmenu', e.target)
      })
      node.on('mouseover', function (e) {
        document.body.style.cursor = 'pointer'
      })
      node.on('mouseout', function (e) {
        document.body.style.cursor = 'default'
      })
      node.on('click', (e) => {
        console.log(e, 'eeeeee')
        canvas.clickItem = e.target
        canvas.contextmenu = {}
        console.log('click', e.target.attrs)
      })
    })
    stage.find('Circle').forEach((node) => {
      if (
        location.href.includes('&type=device') ||
        location.href.includes('evidence')
      ) {
        dgiotlogger.info('dgiotlogger node:', node)
        node
          ? node.setAttrs({
              draggable: false,
            })
          : ''
        node?.parent
          ? node.parent.setAttrs({
              draggable: false,
            })
          : ''
      }
      addNodeEvent({
        type: node.getAttr('name'),
        node: node,
      })
      console.log('这是圆型', node)
      node.on('contextmenu', (e) => {
        canvas.contextmenu = e.target
        console.log('contextmenu', e.target)
      })
      node.on('click', (e) => {
        console.log(e, 'eeeeee')
        canvas.clickItem = e.target
        canvas.contextmenu = {}
        console.log('click', e.target.attrs)
      })
    })

    console.groupCollapsed(
      '%ctopoStage log',
      'color:#009a61; font-size: 28px; font-weight: 300'
    )
    console.info(info)
    console.groupEnd()
  },
}
export default topoStage
