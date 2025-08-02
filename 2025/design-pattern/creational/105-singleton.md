# 单例模式

## 一、介绍

单例模式是一种创建型设计模式，单例模式同时解决了两个问题，所以违反了单一职责原则。

- 保证一个类只有一个实例。
- 为该实例提供一个全局访问节点。

## 二、结构

![单例模式结构](./assets/singleton-structure.png)

单例（Singleton）类声明了一个名为 `get­Instance` 获取实例的静态方法来返回其所属类的一个相同实例。单例的构造函数必须对客户端（Client）代码隐藏。调用 获取实例方法必须是获取单例对象的唯一方式。

## 三、代码

```typescript
class Singleton {
  static #instance: Singleton;
  
  private constructor() { }

  public static get instance(): Singleton {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
}

/**
 * The client code.
 */
function clientCode() {
  const s1 = Singleton.instance;
  const s2 = Singleton.instance;

  if (s1 === s2) {
    console.log('Singleton works, both variables contain the same instance.');
  } else {
    console.log('Singleton failed, variables contain different instances.');
  }
}

clientCode();
```

上面的代码，结果输出如下。

```text
Singleton works, both variables contain the same instance.
```

## 四、特点

- 保证一个类只有一个实例。
- 一个指向该实例的全局访问节点。
- 仅在首次请求单例对象时对其进行初始化。

违反了单一职责原则。该模式在多线程环境下需要进行特殊处理，避免多个线程多次创建单例对象。

单例的客户端代码单元测试可能会比较困难，因为许多测试框架以基于继承的方式创建模拟对象。由于单例类的构造函数是私有的，而且绝大部分语言无法重写静态方法，所以你需要想出仔细考虑模拟单例的方法。

## 五、适用场景

- 如果程序中的某个类对于所有客户端只有一个可用的实例，可以使用单例模式。
- 如果你需要更加严格地控制全局变量，可以使用单例模式。

## 六、与其他模式的关系

- 外观模式类通常可以转换为单例模式类，因为在大部分情况下一个外观对象就足够了。
- 如果你能将对象的所有共享状态简化为一个享元对象，那么享元模式就和单例类似了。但这两个模式有两个根本性的不同。

  1. 只会有一个单例实体，但是享元类可以有多个实体，各实体的内在状态也可以不同。
  2. 单例对象可以是可变的。享元对象是不可变的。

- 抽象工厂模式、生成器模式和原型模式都可以用单例来实现。

## 七、参考
