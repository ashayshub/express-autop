function printToModal(title, data) {
   $('.modal-title').text(title);
   $('.modal-body p').text(data);
   //$('#myModal').modal('show');
   return true;
}


$(document).ready(function() {

    $("#populate").click(function(event){
        var modal_title = "Populate Database";
        $('.modal-title').text(modal_title);
        $('.modal-body p').text('Populating... it may take 10-15 seconds');
        $.ajax({
              type: 'POST',
              url: "/populate"
          
        })
        .done(function(resultData){
                   printToModal(modal_title, resultData);
                   location.href = "/";
        })
        .fail(function() {
              printToModal(modal_title, 'Error: Something went wrong while populating data');
        });
    });

    $("#teardown").click(function(){
        var modal_title = "Drop table";
        $('.modal-title').text(modal_title);
        $('.modal-body p').text('Tearing down...');
        $('#modal-close').attr('data-teardown', '1');
        $.ajax({
              type: 'DELETE',
              url: "/teardown"
        })
        .done(function(resultData){
           printToModal(modal_title, resultData);
        })
        .fail(function() {
              printToModal(modal_title, "Error: Something went wrong while dropping table");
        });
     });

    $("[id^=price-info-]").click(function(){
        var modal_title = "Vehicle Price";
        var price_query = $(this).data("price-query");
        $('.modal-title').text(modal_title);
        $('.modal-body p').text('Fetching price for vehicle...');

        $.ajax({
              type: 'GET',
              url: "/price?price_query=" + encodeURIComponent(price_query)
        })
        .done(function(resultData){
                   body_text = "Base price of the vehicle is $" + resultData.baseMSRP;
                   printToModal(modal_title, body_text);
        })
        .fail(function() {
              printToModal(modal_title, 'Error: Could not fetch the appropriate price');
        });
     });

     $('#myModal').on('hide.bs.modal', function(){
        var refresh = $("#modal-close").data("teardown");
        if (refresh == "1") {
           $("#modal-close").removeAttr('data-teardown');
           location.href = "/";
        }
     });
});

