function save_options() {
    var enhanced = document.getElementById('enhanced').value;
    chrome.storage.sync.set({
      'modelVariant': enhanced    
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  document.getElementById('save').addEventListener('click', save_options);
  