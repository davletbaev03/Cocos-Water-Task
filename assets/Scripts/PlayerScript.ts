import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3, Quat, SkeletalAnimation } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerScript')
export class PlayerScript extends Component {
    @property(SkeletalAnimation)
    characterAnimation: SkeletalAnimation | null = null;

    private currentAnimation = '';

    @property
    speed: number = 5;

    private direction = new Vec3();

    private w = false;
    private a = false;
    private s = false;
    private d = false;

    onEnable() {
        this.characterAnimation = this.node.getComponentInChildren<SkeletalAnimation>(SkeletalAnimation);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        const clips = this.characterAnimation.clips;

        this.characterAnimation.createState(clips[0], 'Idle');
        this.characterAnimation.createState(clips[1], 'Run');

        this.characterAnimation.play('Idle');
    }

    update(deltaTime: number) {
        this.direction.set(0, 0, 0);

        if (this.w) this.direction.z -= 1;
        if (this.s) this.direction.z += 1;
        if (this.a) this.direction.x -= 1;
        if (this.d) this.direction.x += 1;

        if (this.direction.lengthSqr() > 0) {
            this.playAnimation('Run');

            this.direction.normalize();

            const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
            const position = this.node.worldPosition.clone();

            position.add(movement);
            this.node.setWorldPosition(position);

            const targetAngle = Math.atan2(
                -this.direction.x,
                -this.direction.z
            ) * 180 / Math.PI;

            const targetRotation = new Quat();
            Quat.fromEuler(targetRotation, 0, targetAngle, 0);

            const currentRotation = this.node.rotation.clone();

            const smoothRotation = new Quat();
            Quat.slerp(
                smoothRotation,
                currentRotation,
                targetRotation,
                8 * deltaTime
            );

            this.node.setRotation(smoothRotation);
        }
        else {
            this.playAnimation('Idle');
        }
    }

    private playAnimation(name: string) {
        if (this.currentAnimation === name) return;

        this.characterAnimation.play(name);
        this.currentAnimation = name;
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.w = true;
                break;
            case KeyCode.KEY_A:
                this.a = true;
                break;
            case KeyCode.KEY_S:
                this.s = true;
                break;
            case KeyCode.KEY_D:
                this.d = true;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.w = false;
                break;
            case KeyCode.KEY_A:
                this.a = false;
                break;
            case KeyCode.KEY_S:
                this.s = false;
                break;
            case KeyCode.KEY_D:
                this.d = false;
                break;
        }
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}