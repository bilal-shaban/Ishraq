/* إشراق · سلوك الواجهة المشترك (كشف عند التمرير، توهج البطاقات، مؤشر الشريط الأفقي) */
(function(){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  // كشف العناصر عند الظهور
  var els=document.querySelectorAll(".rv");
  if("IntersectionObserver" in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          e.target.style.transitionDelay=(Math.min([].indexOf.call(els,e.target)%4,3)*70)+"ms";
          e.target.classList.add("on");io.unobserve(e.target);
        }
      });
    },{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add("on")});

  // توهج يتبع الإصبع/الماوس على البلاطات
  if(!reduce){
    document.querySelectorAll(".ix-tile").forEach(function(t){
      t.addEventListener("pointermove",function(e){
        var r=t.getBoundingClientRect();
        t.style.setProperty("--mx",(e.clientX-r.left)+"px");
        t.style.setProperty("--my",(e.clientY-r.top)+"px");
      });
    });
  }

  // نقاط مؤشر الشريط الأفقي
  var snap=document.querySelector(".ix-snap"),dots=document.querySelectorAll(".ix-dots i");
  if(snap&&dots.length){
    var kids=snap.children;
    snap.addEventListener("scroll",function(){
      var c=snap.getBoundingClientRect(),mid=c.left+c.width/2,best=0,bd=1e9;
      for(var i=0;i<kids.length;i++){
        var r=kids[i].getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);
        if(d<bd){bd=d;best=i;}
      }
      dots.forEach(function(x,j){x.classList.toggle("on",j===best)});
    },{passive:true});
  }
})();
