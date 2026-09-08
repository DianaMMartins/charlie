export class ParticleBackground {
    constructor() {
        this.particles = [];
        this.particleCount = 120;
    }
    
    addParticle(width, height) {
        const particle = {
            x: Math.random() * width,
            y: Math.random() * height,

            age: 1,
            lifetime: 300 + Math.random() * 300,

            speed: 2 + Math.random() * 1,
            tailLength: 8 + Math.random() * 80,

            color: {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            }
        };

        this.particles.push(particle);
    }

    updateParticles(width, height) {
        while (this.particles.length < this.particleCount) {
            this.addParticle(width, height);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.x -= particle.speed * 0.5;
            particle.y += particle.speed;

            particle.age++;

            if (
                particle.age >= particle.lifetime ||
                particle.y > height + particle.tailLength
            ) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx, width, height) {
        this.updateParticles(width, height);

        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
        ctx.fillRect(0, 0, width, height);

        for (const particle of this.particles) {
            const life =
                1 - particle.age / particle.lifetime;

            const alpha =
                Math.min(1, life) * 0.8;

            const tailX =
                particle.x +
                particle.speed * 0.5 * particle.tailLength;

            const tailY =
                particle.y -
                particle.speed * particle.tailLength;

            const gradient = ctx.createLinearGradient(
                tailX,
                tailY,
                particle.x,
                particle.y
            );

            gradient.addColorStop(
                0,
                `rgba(
                ${particle.color.r},
                ${particle.color.g},
                ${particle.color.b},
                0
            )`
            );

            gradient.addColorStop(
                1,
                `rgba(
                ${particle.color.r},
                ${particle.color.g},
                ${particle.color.b},
                ${alpha}
            )`
            );

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;

            ctx.beginPath();

            ctx.moveTo(tailX, tailY);
            ctx.lineTo(particle.x, particle.y);

            ctx.stroke();

            ctx.fillStyle =
                `rgba(
                ${particle.color.r},
                ${particle.color.g},
                ${particle.color.b},
                ${alpha}
            )`;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                1.5,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }
}