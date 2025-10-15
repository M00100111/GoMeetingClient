// STUN服务器连通性测试工具
export class StunTester {
  static async testStunServer(url: string): Promise<{success: boolean, candidateType?: string, candidate?: RTCIceCandidate}> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ 
          iceServers: [{ urls: url }],
          iceCandidatePoolSize: 5
        });
        
        let resolved = false;
        
        pc.onicecandidate = (event) => {
          if (resolved) return;
          
          if (event.candidate) {
            console.log(`STUN测试 - 收到候选:`, event.candidate);
            if (event.candidate.type === 'srflx') {
              console.log(`STUN测试 - 成功获取反射候选 from ${url}`);
              resolved = true;
              pc.close();
              resolve({
                success: true,
                candidateType: event.candidate.type,
                candidate: event.candidate
              });
            }
          }
        };

        pc.onicegatheringstatechange = () => {
          console.log(`STUN测试 - ICE收集状态 [${url}]:`, pc.iceGatheringState);
          if (pc.iceGatheringState === 'complete' && !resolved) {
            console.log(`STUN测试 - ICE收集完成 [${url}]`);
            resolved = true;
            pc.close();
            resolve({ success: false });
          }
        };

        // 创建一个数据通道以触发ICE候选收集
        pc.createDataChannel('test');
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(err => {
            console.error(`STUN测试 - 创建offer失败 [${url}]:`, err);
            if (!resolved) {
              resolved = true;
              pc.close();
              resolve({ success: false });
            }
          });

        // 设置10秒超时
        setTimeout(() => {
          if (!resolved) {
            console.log(`STUN测试 - 超时 [${url}]`);
            resolved = true;
            pc.close();
            resolve({ success: false });
          }
        }, 10000);
      } catch (error) {
        console.error(`STUN测试 - 创建连接失败 [${url}]:`, error);
        resolve({ success: false });
      }
    });
  }

  static async testMultipleStunServers(urls: string[]): Promise<void> {
    console.log('开始测试STUN服务器连通性...');
    
    // 逐个测试，避免并发问题
    for (const url of urls) {
      console.log(`测试STUN服务器: ${url}`);
      const result = await this.testStunServer(url);
      console.log(`STUN服务器 ${url} 测试结果: ${result.success ? '成功' : '失败'}`, result);
    }
    
    console.log('STUN服务器测试完成');
  }
  
  // Electron环境中测试网络连接
  static testNetworkConnectivity(): void {
    console.log('测试基本网络连通性...');
    
    // 测试DNS解析
    try {
      const stunServers = [
        'stun.l.google.com',
        'stun1.l.google.com',
        'stun.stunprotocol.org'
      ];
      
      stunServers.forEach(server => {
        const img = new Image();
        img.onload = () => console.log(`DNS解析成功: ${server}`);
        img.onerror = () => console.log(`DNS解析失败: ${server}`);
        img.src = `https://${server}:19302/`;
      });
    } catch (e) {
      console.error('DNS解析测试失败:', e);
    }
  }
}

// 测试常用的STUN服务器
if (typeof window !== 'undefined') {
  const commonStunServers = [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun.stunprotocol.org:3478',
    'stun:stun.voiparound.com',
    'stun:stun.voipbuster.com',
    'stun:stun.voipcheap.com',
    'stun:stun.xten.com'
  ];

  // 导出测试函数供外部调用
  (window as any).testStunServers = () => {
    StunTester.testMultipleStunServers(commonStunServers);
  };
  
  (window as any).testNetwork = () => {
    StunTester.testNetworkConnectivity();
  };
}