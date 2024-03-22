import React from 'react'

function Page404() {
  return (
    <>
      <link href={window.location.origin + "/assets/css/page404.css"} rel="stylesheet"></link>
      <div className='content'>
        <img src={window.location.origin+"/assets/images/logo.png"} alt={"logo"} />
        <h1>404</h1>
        <p><i class='bx bx-search'></i> Page Not Found</p>
      </div>
    </>

  )
}

export default Page404