// Promise 的机制就是 then 回调函数必须异步执行。为什么？因为这样保障了代码执行顺序的一致性。先看一个场景：
promise.then(function(){ 
  if (trueOrFalse) { 
    // 同步执行 
    foo(); 
  } else { 
    // 异步执行 (如：使用第三方库)
     setTimeout(function(){ 
        foo(); 
     }) 
  } 
}); 

bar(); 
// 如果 promise then 回调是同步执行的，请问 foo() 和 bar() 函数谁先执行?
// 答案是，如果 trueOrFalse 为 true 则 foo() 先执行，bar() 后执行；否则 bar() 先执行，foo() 后执行。在大部分情况下，你没法预料到 trueOrFalse 的值，这也就意味着，你不能确定这段代码真正的执行顺序，这可能会导致一些难以想到的 bug。如果 promise then 回调是异步执行的，请问 foo() 和 bar() 函数谁先执行?
// 答案一目了然，bar() 先执行，foo() 后执行。所以为了保证代码执行顺序的一致性， then 回调必须保证是异步的。