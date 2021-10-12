import React from "react";

function Samples() {
  return (
    <div className="Samples" style={{paddingBottom: '2em'}}>
      <div style={{
        fontWeight: 'bold',
        padding: '1.5em'
      }}>Sample Pinyottas</div>
      <div style={{ maxWidth: '600px', textAlign: 'left', margin: '0px auto' }}>
        <p>These pieces were created by running the Pinyotta's algorithm on a testnet. The generative art process can sometimes lead to unexpected outputs, so these are merely meant to give an idea of the possibilities of this particular algorithm.</p>
        <div style={{textAlign: "center"}}>
          <p><img src="/sample1.png"></img></p>
          <p><img src="/sample2.png"></img></p>
          <p><img src="/sample3.png"></img></p>
        </div>
      </div>
    </div>
  );
}

export default Samples;