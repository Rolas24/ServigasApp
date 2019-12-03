
// Initialize app
var app = new Framework7({
  smartSelectSearchbar:true
});
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var selPedido=0;
var mispedidos=[];
var pedidoUbicar=0;

var mainView = app.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
  });

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
  setSession();
  if(sUsuario.length>0){
    app.closeModal('.login-screen');
    $$("#txtPnlUsuario").text(sUsuario);
    $$("#txtPnlNombre").text(sNombre); 

  }if(sURL.length===0){
    modalSucursal();
  }
});

$$(document).on('pageInit', function (e) {

  var page = e.detail.page;

  if (page.name === 'acercade') {
    app.closePanel();
  }else if(page.name ==='reportarProblema'){
   initReportarProblema();
 }else if(page.name ==='main'){
   initMain();
 }else if(page.name ==='registro'){
   initRegistro();
 }else if(page.name === 'recuperar'){
   initRecuperar();
 }else if(page.name==='cambiarpass'){
   initCambiarPass();
 }else if(page.name === 'modificarDatos'){
   initModificarDatos();
 }else if(page.name === 'modificarDomicilio'){ 
   initModificarDomicilio();   
 }else if(page.name ==='buscarCalle'){
  initBuscarCalle();
}else if(page.name==='buscarColonia'){
  initBuscarColonia();
}else if(page.name==='mapa'){
  var map = new GoogleMap();
  map.initialize();
}else if(page.name==='ubicacionPedido'){
  var mapubicar = new GoogleMapUbicar();
  mapubicar.initialize();
}
});

function onBackKeyDown() {
 app.alert("okidoki");
}

//Eventos Login
$$("#btnIniciarSesion").click(function(e){
  e.preventDefault();
  iniciarSesion();

});
$$("#btnRegistroUsuario").click(function(e){
  e.preventDefault();
  mainView.router.loadPage('registro.html');
  setTimeout(function () {
    app.closeModal('.login-screen');
  }, 380);
  
  
});
$$("#btnRecuperarContrasenia").click(function(e){
  e.preventDefault();
  mainView.router.loadPage('recuperar.html');
  setTimeout(function () {
    app.closeModal('.login-screen');
  }, 380);
});

//Eventos Panel Main

$$("#btnCerrarPanel").click(function(e){
  e.preventDefault();
  app.closePanel();
});
$$("#btnCerrarSesion").click(function(e){
  e.preventDefault();
  cerrarSesion();
  app.closePanel();
  app.loginScreen();
});


//Eventos Main TAB 1
$$("#btnPedidoEstacionario").click(function(e){
  e.preventDefault();
  pedido(1);
});
$$("#btnPedidoCilindro").click(function(e){
  e.preventDefault();
  pedido(2);
});
$$("#btnMiDomicilio").click(function(e){
  e.preventDefault();
  mainView.router.loadPage('modificarDomicilio.html');
});
$$("#btnUbicarMiPedido").click(function(e){
  e.preventDefault();
  getPedidoUbicar();
});


//Eventos Main TAB 2
$$("#tabMisPedidos").click(function(){
  getPedidos();
});

//Eventos ToolBar
$$("#toolCerrarSesion").click(function(e){
  e.preventDefault();
  cerrarSesion();
  app.loginScreen();
});

$$("#toolPedido").click(function(e){
  e.preventDefault();
  pedido(1);
});

//Eventos Main TAB 3
$$("#tabInfo").click(function(e){
  e.preventDefault();
  info();
});

function iniciarSesion(){
  if(validarInicioSesion()){
    var data = {accion: "5",usuario:$$("#txtLoginUsuario").val(),contrasena:$$("#txtLoginPass").val()};
    $$.ajax({url: sURL, dataType: "json", type: 'POST', data,
     beforeSend: function () {
       app.showPreloader('Iniciando Sesión...');
     },
     success: function (data) {
      if(data.length>0){
       setLocalStorage(data[0].razonsocial,data[0].telefono_celular,data[0].correo,
         data[0].idSucursal,$$("#txtLoginUsuario").val(),$$("#txtLoginPass").val(),
         data[0].idCliente,data[0].idDomicilio,data[0].idCalle,data[0].idColonia,
         data[0].nombre_calle,data[0].nombre_colonia,data[0].numero_interior,data[0].numero_exterior,
         data[0].entrecalles);
       setSession();
       $$("#txtPnlUsuario").text(sUsuario);
       $$("#txtPnlNombre").text(sNombre);  
       $$("#txtLoginUsuario").val("");
       $$("#txtLoginPass").val("");
       app.closeModal('.login-screen');
     }else{
      app.alert("El usuario/contraseña que ingresaste no pertenecen a ninguna cuenta. Comprueba los datos.","Error!");
    }
    app.hidePreloader();
  },
  error: function (e) {
    app.hidePreloader();
    app.alert("Ocurrió un error al iniciar sesión. Intente nuevamente.","Error!");
  }
});

  }
}

function cerrarSesion(){
  $$("#listaMisPedidos").html();
  clearStorage();
  modalSucursal();
}

function pedido(pedido){
  $$.get('pedido.html',function(data){
   app.popup(data);
   $$("#txtPedNombre").val(sNombre);
   $$("#txtPedDireccion").val(sCalle+" "+sNumInt+" "+sNumExt+" Col."+sColonia);
   $$("#txtPedTelefono").val(sTelefono);
   $$("#txtPedCorreo").val(sCorreo);
   var tipo=pedido;
   var obj=null;
   if(pedido===1){
     $$("#contTipoCilindro").hide();
     $$("#sltTipoPedido").val("Estacionario");
     obj=$$("#txtLitros");
   }else if(pedido===2){
     $$("#contLitros").hide();
     $$("#sltTipoPedido").val("Cilindro");
     obj=$$("#sltTipoCilindro");
   }

   $$("#btnGuardarPedido").click(function(e){
     e.preventDefault();
     var datas = {accion: "10",idCliente:sIdCliente,idTipoPedido:tipo,idSucursal:"1",
     idDomicilio:sIdDomicilio,cantidad:obj.val(),observaciones:$$("#txtPedObservaciones").val()};
     if(validarPedido()){
       $$.ajax({url: sURL, dataType: "json", type: 'POST', datas,
         beforeSend: function () {
           app.showPreloader('Guardando Pedido...');
         },
         success: function (data) {
          if(data.length>0){ 
            app.closeModal(".popup",true);         
            app.alert("Pedido Guardado correctamente","Exito!");

          }else{
            app.alert("Error al guardar su pedido intente nuevamente","Error!");
          }
          app.hidePreloader();
        },
        error: function (e) {
          app.hidePreloader();
          app.alert("Error al guardar su pedido.","Error!");
        }
      });
     }else{
      app.alert("Recuerde que es necesario registrar Su domicilio y Razón Social para poder"+
        " solicitar un pedido","Aviso!");
    }
  });
 });

}

function getPedidos(){
 var data = {accion: "13",idCliente:sIdCliente};
 $$.ajax({url: sURL, dataType: "json", type: 'POST', data,
   beforeSend: function () {
    app.showPreloader('Actualizando Pedidos...');
  },
  success: function (data) {
    if(data.length>0){     
      mispedidos=data;
      $$("#listaMisPedidos").html("");
      var html="";    
      for (var i = 0; i < data.length; i++) {
        var icontemp="";
        var estatustemp="";
        if(data[i].estatus==="1"){
          icontemp='estatus_enproceso.png';
          estatustemp='registrado';
        }else if(data[i].estatus==="2"){
          icontemp='estatus_encamino.png';
          estatustemp='En camino';
        }else if(data[i].estatus==="3"){
          icontemp='estatus_surtido.png';
          estatustemp='Surtido';
        }else if(data[i].estatus==="4"){
          icontemp='cancelado.png';
          estatustemp='Cancelado';
        }
        html='<li id="ped'+data[i].idPedido+'" class="card" data-idpedido="'+data[i].idPedido+'">'+
        '<div class="card-header">Folio: '+data[i].idPedido+'<strong> '+data[i].fechaHoraRegistro+'</strong></div>'+
        '<div class="card-content">'+
        '<div class="card-content-inner">'+
        'Tipo pedido: '+data[i].tipopedido+'<br>'+
        'estatus: '+estatustemp+" "+
        '<img src="../img/'+icontemp+'" width="18" height="18"/>'+
        '</div>'+
        '</div>'+
        '<div class="card-footer"><a href="#" class="button active">Detalle</a></div>'+
        '</li>'
        $$("#listaMisPedidos").append(html);
        addClickPedido($$("#ped"+data[i].idPedido));
      }
    }else{
      app.alert("No se encontro ningun pedido registrado","Sin pedidos");
    }
    app.hidePreloader();
  },
  error: function (e) {
    app.hidePreloader();
    app.alert("Error al mostrar su historial de pedidos","Error!");
  }
});
}
function getPedidoUbicar(){
 var data = {accion: "13",idCliente:sIdCliente};
 $$.ajax({url: sURL, dataType: "json", type: 'POST', data,
   beforeSend: function () {
    app.showPreloader('Espere...');
  },
  success: function (data) {
    if(data.length>0){     
      mispedidos=data;
      var existe=false;
      for (var i = 0; i < data.length; i++) {
       if(data[i].estatus==="2"){
        existe=true;
        pedidoUbicar=data[i].idPedido;
        break;
      }
    }
    if(existe){
      mainView.router.loadPage('ubicacionPedido.html');
    }else{
      app.alert("Ningun pedido en trayecto","Sin trayectos");
    }

  }else{
    app.alert("No se encontro ningun pedido registrado","Sin pedidos");
  }
  app.hidePreloader();
},
error: function (e) {
  app.hidePreloader();
  app.alert("Error al mostrar su historial de pedidos","Error!");
}
});
}

function addClickPedido(obj){
  obj.click(function(e){
    e.preventDefault();
    selPedido=$$(this).attr('data-idpedido');
    $$.get('detallePedido.html',function(data){
      app.popup(data);
      $$("#btnCancelarPedido").click(function(e){
        e.preventDefault();
        cancelarPedido();
      });
      for (var i = 0; i < mispedidos.length; i++) {
        if(mispedidos[i].idPedido===selPedido){
          var estatustemp="";
          if(mispedidos[i].estatus==="1"){
            estatustemp='Registrado';
          }else if(mispedidos[i].estatus==="2"){
            estatustemp='En Camino';
          }else if(mispedidos[i].estatus==="3"){
            estatustemp='Surtido';
            $$("#btnCancelarPedido").attr('disabled','disabled');
          }else if(mispedidos[i].estatus==="4"){
            estatustemp='Cancelado';
            $$("#btnCancelarPedido").attr('disabled','disabled');
          }
          $$("#txtDPFolio").val(mispedidos[i].idPedido);
          $$("#txtDPFecha").val(mispedidos[i].fechaHoraRegistro);
          $$("#txtDPTipo").val(mispedidos[i].tipopedido);
          $$("#txtDPUnidad").val(mispedidos[i].unidad);
          $$("#txtDPCantidad").val("Pendiente");
          $$("#txtDPEstatus").val(estatustemp);
          $$("#txtDPObservaciones").val(mispedidos[i].observaciones);
          break;
        }
      }
      
    });

  });
}
function cancelarPedido(){
  data={$$("#txtDPFolio").val()};
  $$.ajax({url: sURL, dataType: "json", type: 'POST', data,
   beforeSend: function () {
     app.showPreloader('Guardando Pedido...');
   },
   success: function (data) {
    if(data.length>0){ 
      app.closeModal(".popup",true);         
      app.alert("Pedido Guardado correctamente","Exito!");

    }else{
      app.alert("Error al guardar su pedido intente nuevamente","Error!");
    }
    app.hidePreloader();
  },
  error: function (e) {
    app.hidePreloader();
    app.alert("Error al guardar su pedido.","Error!");
  }
});
}

function info(){
  $$("#txtT3Nombre").val(sNombre);
  $$("#txtT3Usuario").val(sUsuario);
  $$("#txtT3Correo").val(sCorreo);
  $$("#txtT3Telefono").val(sTelefono);
  $$("#txtT3Calle").val(sCalle);
  $$("#txtT3Colonia").val(sColonia);
  $$("#txtT3NumExt").val(sNumExt);
  $$("#txtT3NumInt").val(sNumInt);
  $$("#txtT3EntreCalles").val(sEntreCalles);

}

function validarInicioSesion(){
  var bnd=true;
  bnd=bnd && validInputVacio($$("#txtLoginUsuario"),"Usuario");
  bnd=bnd && validInputVacio($$("#txtLoginPass"),"Contraseña");
  bnd=bnd && validInputMaxMin($$("#txtLoginUsuario"),6,"Usuario");
  bnd=bnd && validInputMaxMin($$("#txtLoginPass"),6,"Contraseña");
  return bnd;
}

function validarPedido(){
  var bnd=true;
  bnd=bnd && validInputVacio($$("#txtPedNombre"),"Nombre");
  bnd=bnd && validInputVacio($$("#txtPedDireccion"),"Dirección");
  return bnd;
}