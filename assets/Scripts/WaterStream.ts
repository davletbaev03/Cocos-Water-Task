import {
    _decorator,
    Component,
    input,
    Input,
    MeshRenderer,
    PhysicsSystem,
    geometry,
    Node,
    RigidBody,
    Quat,
    Vec3,
    ParticleSystem
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WaterStream')
export class WaterStream extends Component {

    @property(MeshRenderer)
    streamRenderer: MeshRenderer = null!;

    @property
    hosePoint: Node = null!;

    @property(Node)
    waterSplash: Node = null!;

    @property(Node)
    waterDrop: Node = null!;

    @property
    waterDropLifetime = 0.8;

    @property
    waterDropRate = 700;

    @property
    private maxForce = 0.5;

    @property
    maxDistance = 5;

    private isShooting = false;

    private waterSplashParticle: ParticleSystem = null!;
    private waterDropParticle: ParticleSystem = null!;

    protected onLoad() {
        this.waterSplashParticle =
            this.waterSplash.getComponent<ParticleSystem>(ParticleSystem)!;

        this.waterDropParticle =
            this.waterDrop.getComponent<ParticleSystem>(ParticleSystem)!;

        this.waterSplashParticle.rateOverTime.constant = 0;
        this.waterDropParticle.rateOverTime.constant = 0;
    }

    protected onEnable() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

        this.stopEffects();
        this.streamRenderer.enabled = false;
    }

    protected update() {
        if (!this.isShooting) {
            return;
        }
        this.calculateRaycast();
    }

    private calculateRaycast() {
        const origin = this.hosePoint.worldPosition;
        const direction = this.hosePoint.up;
        const results = this.raycast(origin, direction);

        this.updateWaterDrop(origin, direction);

        if (results.length > 0) {
            this.updateWaterSplash(results[0], direction);
            this.pushObject(results[0], direction);
        } else {
            this.waterSplashParticle.rateOverTime.constant = 0;
            this.waterDropParticle.startLifetime.constant =
                this.waterDropLifetime;
        }
    }

    private raycast(origin: Vec3, direction: Vec3) {
        const ray = geometry.Ray.create(
            origin.x,
            origin.y,
            origin.z,
            direction.x,
            direction.y,
            direction.z
        );

        PhysicsSystem.instance.raycast(
            ray,
            0xffffffff,
            this.maxDistance
        );

        return PhysicsSystem.instance.raycastResults;
    }

    private updateWaterSplash(
        result: any,
        direction: Vec3
    ) {
        this.waterDropParticle.startLifetime.constant =
            result.distance / (this.maxDistance * 5);

        this.waterSplash.setWorldPosition(result.hitPoint);

        const rotation = new Quat();
        Quat.fromViewUp(rotation, direction);
        this.waterSplash.setWorldRotation(rotation);

        this.waterSplashParticle.rateOverTime.constant = this.waterDropRate;
    }

    private updateWaterDrop(
        origin: Vec3,
        direction: Vec3
    ) {
        this.waterDrop.setWorldPosition(origin);

        const rotation = new Quat();
        Quat.fromViewUp(
            rotation,
            direction.clone().negative()
        );

        this.waterDrop.setWorldRotation(rotation);
        this.waterDropParticle.rateOverTime.constant = this.waterDropRate;
    }

    private pushObject(
        result: any,
        direction: Vec3
    ) {
        const rigidBody =
            result.collider.node.getComponent(RigidBody);

        if (!rigidBody) {
            return;
        }

        const force =
            this.maxForce *
            (1 - result.distance / this.maxDistance);

        rigidBody.applyImpulse(
            direction.clone().multiplyScalar(force)
        );
    }

    private onMouseDown() {
        this.streamRenderer.enabled = true;
        this.isShooting = true;
    }

    private onMouseUp() {
        this.streamRenderer.enabled = false;
        this.isShooting = false;

        this.stopEffects();
    }

    private stopEffects() {
        this.waterDropParticle.rateOverTime.constant = 0;
        this.waterSplashParticle.rateOverTime.constant = 0;
    }

    protected onDisable() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
}