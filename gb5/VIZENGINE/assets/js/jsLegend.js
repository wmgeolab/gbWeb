class JSLegend {
    constructor(vopts = {}) {
       this.opts = Object.assign({
          id: null 
          ,orientation: 0
          //,colors: '#0247FE,#347C98,#66B032,#B2D732,#FEFE33,#FCCC1A,#FB9902,#FC600A,#FE2712,#C21460'
          ,values: ''
          ,labels: ""
          ,minValue: 0
          ,maxValue: 0
          ,opacity: 1
          ,steps: 0
          ,labelRotate: 0
          ,labelStyleFn: null
          ,title: 'Title'
          ,footer: null 
          ,thickness: '15px'
          ,type: 'gradient'
          ,cellStyleFn: null
          ,translate: 0
       }, vopts);
 
       var regex = /[^#a-f0-9,]/gi;
       this.colors = this.opts.colors.replace(regex, '').split(',');
       this.labels = this.opts.labels.length ? this.opts.labels.split(";") : [];
 
       regex = /[^0-9\.\-\,]/g;
       this.values = this.opts.values.length ? this.opts.values.replace(regex, '').split(',') : [];
       this.values = this.values.filter((v, i, a) => a.indexOf(v) === i);
       this.values = this.values.sort(function(a, b){return a - b});
 
       this.legend = null;
       this.scaleHead = null;
       this.scaleHeadContent = null;
       this.scaleBody = null;
       this.scaleBodyContent = null;
       this.scale = null;
       this.scaleLabels = null;
       this.span = '';
       this.deg = '180deg';
       this.type = this.opts.type.toLowerCase();
       this.range = 0;
       this.opacityHex = this.opts.opacity === 1 ? 'ff' : parseInt(255 * this.opts.opacity).toString(16).padStart(2, '0');
       this.decColors = this.hexColors2Dec(this.colors);
       this.minValue = this.opts.minValue;
       this.maxValue = this.opts.maxValue;
 
       this.createLegend();
       this.drawLegend();
    }
 
    createLegend() { 
       if(this.opts.id === null || (this.legend = document.getElementById(this.opts.id)) === null) return;
       this.hideLegend();
       var i = 0;
 
       if(this.labels.length) {
          this.values = [];
          for(i = 0; i < this.labels.length; i++) this.values.push(i);
          this.minValue = 0; 
          this.maxValue = this.labels.length - 1; 
          this.opts.steps = this.labels.length;
       }
 
       if(this.minValue === this.maxValue && this.values.length) {
          this.minValue = Number(this.values[0]); 
          this.maxValue = Number(this.values[this.values.length - 1]); 
       }
       this.range = this.maxValue - this.minValue;
 
       var steps = !this.opts.steps ? this.colors.length : this.opts.steps;
       if(!this.values.length) {
          this.values = [];
          var step = this.range / steps;
          for(i = 0; i <= steps ; i++) this.values.push(Number(this.minValue + (step * i)));
       }
       if(this.minValue < this.values[0]) this.values.unshift(Number(this.minValue));
       if(this.maxValue > this.values[this.values.length - 1]) this.values.push(Number(this.maxValue));
       for(i = 0; i < this.values.length; i++) this.values[i] = Number(this.values[i]);
 
       this.span = '';
       this.deg = '180deg';
       if(this.opts.orientation > 0) {
          this.span = 'Span';
          this.deg = '90deg';
       }
 
       var uid = Date.now();
 
       this.table = document.createElement("table"); 
       this.legend.appendChild(this.table);
       this.table.id = uid + '_legendTable';
       this.table.className = 'jsLegendTable';
 
       this.scaleHead = this.table.insertRow(-1);
       this.scaleHead.id = uid + '_scaleHead';
       this.scaleHeadContent = this.scaleHead.insertCell(-1);
       this.scaleHeadContent.id = uid + '_scaleHeadContent';
       this.scaleHeadContent.className = 'jsLegendscaleHeadContent' + this.span;
       this.scaleHeadContent.innerHTML = this.opts.title;
 
       this.scaleBody = this.table.insertRow(-1);
       this.scaleBody.id = uid + '_scaleBody';
 
       this.scaleBodyContent = this.scaleBody.insertCell(-1);
       this.scaleBodyContent.id = uid + '_scaleBodyContent';
       this.scaleBodyContent.className = 'jsLegendscaleBodyContent' + this.span;
 
       if(this.type === 'gradient' || this.type === 'colorstop') {
          this.scale = document.createElement("div"); 
          this.scale.id = uid + "_scale";
          this.scale.className = "jsLegendscale" + this.span;
          this.span.length ? this.scale.style.height = this.opts.thickness : this.scale.style.width = this.opts.thickness;
          this.scaleBodyContent.appendChild(this.scale);
       }
 
       this.scaleFoot = this.table.insertRow();
       this.scaleFoot.id = uid + '_scaleFoot';
       this.scaleFootContent = this.scaleFoot.insertCell();
       this.scaleFootContent.id = uid + '_scaleFootContent';
       this.scaleFootContent.className = 'jsLegendscaleFootContent' + this.span;
       if(this.opts.footer !== null) this.scaleFootContent.innerHTML = this.opts.footer;
 
       this.scaleLabels = document.createElement("div"); 
       this.scaleLabels.id = uid + "_scaleLabels";
       this.scaleLabels.className = "jsLegendscaleLabels" + this.span;
       this.scaleBodyContent.appendChild(this.scaleLabels);
    }
 
    drawLegend() {
       if(this.legend === null) return;
 
       var adj = 100 * (this.minValue / this.range);
       var pcts = [];
       for(var i = 0; i < this.values.length; i++) {
          pcts.push(Number(
             !this.opts.translate ? (i / (this.values.length - 1)) * 100 : (100 * (this.values[i] / this.range)) - adj
          ).toFixed(2));
       }
 
       var hexStr = '';
       var pct = '';
       for(i = 0; i < this.colors.length; i++) {
          
          if(this.type === 'colorstop') {
             if(!i) pct = pcts[i + 1] + '%';
             else if(i === this.colors.length - 1) pct = pcts[i] + '%';
             else pct = pcts[i] + '% ' + pcts[i + 1] + '%';
             hexStr += this.colors[i].length === 9 ? this.colors[i] + pct + ',' : this.colors[i] + this.opacityHex + ' ' + pct + ',';
          } else if(this.opts.translate) {
             pct = pcts.length ? ' ' + pcts[i + 1] + '%' : '';
             hexStr += this.colors[i].length === 9 ? this.colors[i] + pct + ',' : this.colors[i] + this.opacityHex + ' ' + pct + ',';
          } else {
             hexStr += this.colors[i].length === 9 ? this.colors[i] + ',' : this.colors[i] + this.opacityHex + ',';
          }
       }
       hexStr = hexStr.slice(0, -1);
 
       if(this.type === 'gradient' || this.type === 'colorstop') this.scale.style.background = 'linear-gradient(' + this.deg + ', ' + hexStr + ')';
 
       var v = null;
       var inc = 0;
       var lines = '';
       var how = '';
       var cellStyle = '';
       var labelRotate = this.opts.labelRotate ? 'transform-origin: left top;  transform: rotate(' + this.opts.labelRotate + 'deg) translate(-5%, -50%);' : '';
       var display = this.type === 'cell' && this.opts.orientation > 0 ? 'display: inline-block;' : '';
 
       var maxlen = 0;
       var maxLenStr = '';
       var len = 0;
       for(i = 0; i < this.values.length; i++) {
          if(this.values[i] < this.minValue || this.values[i] > this.maxValue) continue;
 
          if(this.labels.length)
             v = this.opts.labelStyleFn !== null ? this.opts.labelStyleFn(i, this) + '' : this.labels[i] + '';
          else
             v = this.opts.labelStyleFn !== null ? this.opts.labelStyleFn(i, this) + '' : this.values[i] + '';
 
          len = Number(v.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/gm, '').length);
          if(len > maxlen) {
             maxlen = len;
             maxLenStr = v + '&nbsp;';
          }
 
          inc = !this.opts.translate && this.values.length - this.colors.length < 2 
             ? (i / this.colors.length) * 100 
             : (100 * (this.values[i] / this.range)) - adj
          ;
 
          how = this.span.length ? 'left' : 'top';
          if(this.type === 'gradient' || this.type === 'colorstop') {
             lines += this.format('<span class="jsLegendlabelText{0}" style="{1}: {2}%; {3};">{4}</span>', this.span, how, inc.toFixed(2), labelRotate, v);
          } else {
             cellStyle = this.opts.cellStyleFn === null
                ? this.format('vertical-align: middle; margin-bottom: 5px; width: {0}; height: {1}; background-color: {2};', this.opts.thickness, this.opts.thickness, this.colors[i])
                : this.opts.cellStyleFn(i, this);
 
             lines += this.format('<div style="{0} padding: 0px; margin: 0px; padding-right: 20px; width: fit-content;"><div class="jsLegendCell" style="{1}"></div><span>&nbsp;{2}</span></div>', display, cellStyle, v);
          }
       }
       this.scaleLabels.innerHTML += lines;
       if(this.opts.orientation === 0 && this.opts.type !== 'cell') {
          this.scaleFootContent.innerHTML += '<div class="labelJig" style="padding-left: ' + this.opts.thickness + ';">&nbsp;' + maxLenStr + '</div>';
       //   this.scaleLabels.style.width = 'calc(' + maxlen + ' * .75em + ' + this.opts.thickness + ')';
       }
    }
 
    hideLegend() {
       if(this.legend !== null) this.legend.style.visibility = 'hidden';
    }
 
    showLegend() {
       if(this.legend !== null) this.legend.style.visibility = 'visible';
    }
 
    hexColors2Dec(colors = []) {
       var res = [];
       for(var i = 0; i < colors.length; i++) {
          res[i] = [];
          for(var j = 0; j < 6; j+=2) {
             res[i].push(parseInt(colors[i].replace('#','').substr(j, 2), 16));
          }
       }
       return res;
    }
 
    format(fmt = '', ...args) {
       for(var i = 0; i < args.length; i++) {
          var regexp = new RegExp('\\{'+i+'\\}', 'g');
          fmt = fmt.replace(regexp, args[i]);
       }
       return fmt;
    }
 };