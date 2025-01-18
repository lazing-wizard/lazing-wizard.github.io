
// Matrix and vectors operations

// Vectors are represented vertically
// Transfromation vectors in matrix are represented vertically

export class Mat {
    constructor(height, width, ...data) {
        this.height = height;
        this.width = width;
        if (data.length == 0) {
            this.data = new Array(this.height * this.width);
        } else if (data.length == this.height * this.width) {
            this.data = data;
        } else {
            throw new Error('Incorrect number of arguments for Mat data');
        }
    };
}

Mat.buffers = {
    common: new Array(26),
    get: function(n) {
        if (n <= 25) {
            return this[n];
        } else {
            if (n > this.common.length) {
                this.common = new Array(n);
            }
            return this.common;
        }
    }
};
for (let i = 0; i <= 25; ++i) {
    Mat.buffers[i] = new Array(i);
}

export function mat(height, width, ...data) {
    return new Mat(height, width, ...data);
}
export function vec1() {
    if (arguments.length && arguments.length != 1) throw new Error('Incorrect values for vec1');
    return mat(1, 1, ...arguments);
}
export function vec2() {
    if (arguments.length && arguments.length != 2) throw new Error('Incorrect values for vec2');
    return mat(2, 1, ...arguments);
}
export function vec3() {
    if (arguments.length && arguments.length != 3) throw new Error('Incorrect values for vec3');
    return mat(3, 1, ...arguments);
}
export function vec4() {
    if (arguments.length && arguments.length != 4) throw new Error('Incorrect values for vec4');
    return mat(4, 1, ...arguments);
}
export function vec5() {
    if (arguments.length && arguments.length != 5) throw new Error('Incorrect values for vec5');
    return mat(5, 1, ...arguments);
}
export function mat1() {
    if (arguments.length && arguments.length != 1) throw new Error('Incorrect values for mat1');
    return mat(1, 1, ...arguments);
}
export function mat2() {
    if (arguments.length && arguments.length != 4) throw new Error('Incorrect values for mat2');
    return mat(2, 2, ...arguments);
}
export function mat3() {
    if (arguments.length && arguments.length != 9) throw new Error('Incorrect values for mat3');
    return mat(3, 3, ...arguments);
}
export function mat4() {
    if (arguments.length && arguments.length != 16) throw new Error('Incorrect values for mat4');
    return mat(4, 4, ...arguments);
}
export function mat5() {
    if (arguments.length && arguments.length != 25) throw new Error('Incorrect values for mat5');
    return mat(5, 5, ...arguments);
}

Mat.prototype.assign = function() {
    if (arguments.length > 0) {
        if (arguments[0] instanceof Mat) {
            if (this.data.length != arguments[0].data.length) {
                throw new Error('Incorrect dimensions for Mat assign');
            }
            for (let i = 0; i < arguments[0].data.length; ++i) {
                this.data[i] = arguments[0].data[i];
            }
            return this;
        }
    }
    if (arguments.length != this.data.length) {
        throw new Error('Incorrect number of arguments for Mat assign');
    }
    for (let i = 0; i < arguments.length; ++i) {
        this.data[i] = arguments[i];
    }
    return this;
};
Mat.prototype.get = function(i, j) {
    if (i >= this.height) throw new Error('Height out of bounds in Mat get');
    if (j >= this.width) throw new Error('Width out ouf bounds in Mat get');
    return this.data[i * this.width + j];
};
Mat.prototype.set = function(i, j, v) {
    if (i >= this.height) throw new Error('Height out of bounds in Mat set');
    if (j >= this.width) throw new Error('Width out ouf bounds in Mat set');
    this.data[i * this.width + j] = v;
    return this;
};
Object.defineProperty(Mat.prototype, 'x', {
    get() {
        if (this.width != 1) throw new Error('Calling x() on non vector');
        if (this.height < 1) throw new Error('Not high enough dimension for x()');
        return this.data[0];
    },
    set(v) {
        if (this.width != 1) throw new Error('Calling x() on non vector');
        if (this.height < 1) throw new Error('Not high enough dimension for x()');
        this.data[0] = v;
    }
});
Object.defineProperty(Mat.prototype, 'y', {
    get() {
        if (this.width != 1) throw new Error('Calling y() on non vector');
        if (this.height < 2) throw new Error('Not high enough dimension for y()');
        return this.data[1];
    },
    set(v) {
        if (this.width != 1) throw new Error('Calling y() on non vector');
        if (this.height < 2) throw new Error('Not high enough dimension for y()');
        this.data[1] = v;
    }
});
Object.defineProperty(Mat.prototype, 'z', {
    get() {
        if (this.width != 1) throw new Error('Calling z() on non vector');
        if (this.height < 3) throw new Error('Not high enough dimension for z()');
        return this.data[2];
    },
    set(v) {
        if (this.width != 1) throw new Error('Calling z() on non vector');
        if (this.height < 3) throw new Error('Not high enough dimension for z()');
        this.data[2] = v;
    }
});
Object.defineProperty(Mat.prototype, 'w', {
    get() {
        if (this.width != 1) throw new Error('Calling w() on non vector');
        if (this.height < 4) throw new Error('Not high enough dimension for w()');
        return this.data[3];
    },
    set(v) {
        if (this.width != 1) throw new Error('Calling w() on non vector');
        if (this.height < 4) throw new Error('Not high enough dimension for w()');
        this.data[3] = v;
    }
});

Mat.prototype.chose_reusable_space = function(reused, height, width) {
    if (reused instanceof Mat) {
        if (reused.height * reused.width == height * width) {
            reused.height = height;
            reused.width = width;
            return reused;
        } else {
            throw new Error('Incorrect size for reused space for mat');
        }
    } else if (reused === undefined) {
        return new Mat(height, width);
    } else {
        throw new Error('Incorrect type for reused space for mat');
    }
};

Mat.prototype.add_number = function(n, reused) {
    const result = this.chose_reusable_space(reused, this.height, this.width);
    for (let i = 0; i < this.data.length; ++i) {
        result.data[i] = this.data[i] + n;
    }
    return result;
};
Mat.prototype.add_number_inplace = function(n) {
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] += n;
    }
    return this;
};
Mat.prototype.add = function(m, reused) {
    if (!(m instanceof Mat)) {
        return this.add_number(m, reused);
    }
    const result = this.chose_reusable_space(reused, this.height, this.width);
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat addition');
    }
    for (let i = 0; i < this.data.length; ++i) {
        result.data[i] = this.data[i] + m.data[i];
    }
    return result;
};
Mat.prototype.add_inplace = function(m) {
    if (!(m instanceof Mat)) {
        return this.add_number_inplace(m);
    }
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat addition');
    }
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] += m.data[i];
    }
    return this;
};

Mat.prototype.sub_number = function(n, reused) {
    const result = this.chose_reusable_space(reused, this.height, this.width);
    for (let i = 0; i < this.data.length; ++i) {
        result.data[i] = this.data[i] - n;
    }
    return result;
};
Mat.prototype.sub_number_inplace = function(n) {
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] -= n;
    }
    return this;
};
Mat.prototype.sub = function(m, reused) {
    if (!(m instanceof Mat)) {
        return this.sub_number(m, reused);
    }
    const result = this.chose_reusable_space(reused, this.height, this.width);
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat subtraction');
    }
    for (let i = 0; i < this.data.length; ++i) {
        result.data[i] = this.data[i] - m.data[i];
    }
    return result;
};
Mat.prototype.sub_inplace = function(m) {
    if (!(m instanceof Mat)) {
        return this.sub_number_inplace(m);
    }
    if (this.width != m.width || this.height != m.height) {
        throw new Error('Incorrect size for mat subtraction');
    }
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] -= m.data[i];
    }
    return this;
};

Mat.prototype.mul_number = function(n, reused) {
    const result = this.chose_reusable_space(reused, this.height, this.width);
    for (let i = 0; i < this.data.length; ++i) {
        result.data[i] = this.data[i] * n;
    }
    return result;
};
Mat.prototype.mul_number_inplace = function(n) {
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] *= n;
    }
    return this;
};
// Matrix multiplication for "m" on the left, and "this" on the right
Mat.prototype.mul = function(m, reused) {
    if (!(m instanceof Mat)) {
        return this.mul_number(m, reused);
    }
    if (this.height != m.width) {
        throw new Error('Incorrect size for mat multiplication');
    }
    const new_height = m.height;
    const new_width = this.width;
    const result = this.chose_reusable_space(reused, new_height, new_width);
    let target;
    if (result === this) {
        target = Mat.buffers.get(new_height * new_width);
    } else {
        target = result.data;
    }
    for (let i = 0; i < new_height; ++i) {
        for (let j = 0; j < new_width; ++j) {
            let sum = 0;
            for (let x = 0; x < m.width; ++x) {
                sum += m.data[m.width*i + x] * this.data[x * this.width + j];
            }
            target[new_width*i + j] = sum;
        }
    }
    if (result === this) {
        const result_data = result.data;
        for (let i = 0; i < result_data.length; ++i) {
            result_data[i] = target[i];
        }
    }
    return result;
};
Mat.prototype.mul_inplace = function(m) {
    if (!(m instanceof Mat)) {
        return this.mul_number_inplace(m);
    }
    if (this.height != m.width) {
        throw new Error('Incorrect size for mat multiplication');
    }
    
    const new_height = m.height;
    const new_width = this.width;
    
    const target = Mat.buffers.get(new_height * new_width);
    for (let i = 0; i < new_height; ++i) {
        for (let j = 0; j < new_width; ++j) {
            let sum = 0;
            for (let x = 0; x < m.width; ++x) {
                sum += m.data[i*m.width + x] * this.data[x*this.width + j];
            }
            target[i*new_width + j] = sum;
        }
    }
    for (let i = 0; i < this.data.length; ++i) {
        this.data[i] = target[i];
    }
    return this;
};

// Columnwise normalization
Mat.prototype.normalize = function(reused) {
    const result = this.chose_reusable_space(reused, this.height, this.width);
    for (let j = 0; j < this.width; ++j) {
        let sum = 0;
        for (let i = 0; i < this.height; ++i) {
            sum += this.data[this.width*i + j] * this.data[this.width*i + j];
        }
        sum = Math.sqrt(sum);
        for (let i = 0; i < this.height; ++i) {
            result.data[this.width*i + j] = this.data[this.width*i + j] / sum;
        }
    }
    return result;
};
Mat.prototype.normalize_inplace = function() {
    for (let j = 0; j < this.width; ++j) {
        let sum = 0;
        for (let i = 0; i < this.height; ++i) {
            sum += this.data[this.width*i + j] * this.data[this.width*i + j];
        }
        sum = Math.sqrt(sum);
        for (let i = 0; i < this.height; ++i) {
            this.data[this.width*i + j] /= sum;
        }
    }
    return this;
};
Mat.prototype.transpose = function(reused) {
    const result = this.chose_reusable_space(reused, this.width, this.height);
    const buffer = Mat.buffers.get(this.height * this.width);
    for (let i = 0; i < this.height; ++i) {
        for (let j = 0; j < this.width; ++j) {
            buffer[this.height*j + i] = this.data[this.width*i + j];
        }
    }
    for (let i = 0; i < result.data.length; ++i) {
        result.data[i] = buffer[i];
    }
    return result;
};
Mat.prototype.transpose_inplace = function() {
    if (this.width !== this.height) {
        const buffer = Mat.buffers.get(this.height * this.width);
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++j) {
                buffer[this.height*j + i] = this.data[this.width*i + j];
            }
        }
        for (let i = 0; i < this.data.length; ++i) {
            this.data[i] = buffer[i];
        }
        [this.width, this.height] = [this.height, this.width];
    } else {
        for (let i = 0; i < this.height; ++i) {
            for (let j = i + 1; j < this.width; ++j) {
                const temp = this.data[this.width*i + j];
                this.data[this.width*i + j] = this.data[this.width*j + i];
                this.data[this.width*j + i] = temp;
            }
        }
    }
    return this;
};
Mat.prototype.dot = function(v) {
    if (this.width != 1 || v.width != 1) throw new Error('Trying to dot multiply matrix');
    if (this.height != v.height) throw new Error('Trying to dot multiply vectors of different dimensions');
    let value = 0;
    for (let i = 0; i < this.height; ++i)
        value += this.data[i] * v.data[i];
    return value;
};
// Returns vector of this projected on v
Mat.prototype.project = function(v, reused) {
    if (this.width != 1 || v.width != 1) throw new Error('Trying to project non-vector');
    if (this.height != v.height) throw new Error('Trying to project vectors of different dimensions');
    //let dir = v;
    //v = this;
    //let m = mat2(dir.x*dir.x, dir.x*dir.y,
    //             dir.y*dir.x, dir.y*dir.y);
    //let m1 = mat2(dir.x, dir.x,
    //              dir.y, dir.y);
    //let m2 = mat2(dir.x, 0.0,
    //              0.0,     dir.y);
    //m = m2.mul(m1);
    //return v.mul(m).mul(1/pow(dir.length, 2));
    return v.mul_number(this.dot(v)/v.dot(v), reused);
};
Mat.prototype.project_inplace = function(v) {
    if (this.width != 1 || v.width != 1) throw new Error('Trying to project non-vector');
    if (this.height != v.height) throw new Error('Trying to project vectors of different dimensions');
    return this.mul_number_inplace(this.dot(v)/v.dot(v));
};
// Returns vector of this rotated in direction of v 
Mat.prototype.align = function(v, reused) {
    return v.mul_number(this.length/v.length, reused);
};
Mat.prototype.align_inplace = function(v) {
    return this.mul_number_inplace(this.length/v.length);
};
Object.defineProperty(Mat.prototype, 'length', {
    get() {
        if (this.width != 1) throw new Error('Trying to get length of non vector');
        let value = 0;
        for (var i = 0; i < this.height; ++i)
            value += this.data[i] * this.data[i];
        return Math.sqrt(value);
    }
});
Object.defineProperty(Mat.prototype, 'dim', {
    get() {
        if (this.height == 1 || this.width == this.height)
            return this.width;
        else
            throw new Error('Vector and nonsquare matrix needs to be specified');
    }
});
Object.defineProperty(Mat.prototype, 'dim_v', {
    get() { return this.height; }
});
Object.defineProperty(Mat.prototype, 'dim_h', {
    get() { return this.width[1]; }
});
