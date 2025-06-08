import React, { useLayoutEffect } from "react";

import styles from "./Preview.module.css";

export default React.forwardRef(function Preview({ header, text }, ref) {
  useLayoutEffect(function() {
    window.jQuery('.slab-text-target').slabText();
  });

  return (
    <div className={styles.container}>
      <div ref={ref}>
        {header}
        <div className={`slab-text-target ${styles.slabText}`}>
          {text}
        </div>
      </div>
    </div>
  );
});
