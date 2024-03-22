import React from 'react'

function Footer() {
  return (
    <>
      <link href={window.location.origin + "/assets/css/admin_footer.css"} rel="stylesheet"></link>
      <footer id="footer" class="footer">
        <div class="copyright">
          &copy; Copyright <strong><span>Veggiz</span></strong>. All Rights Reserved
        </div>
      </footer>
    </>
  )
}

export default Footer