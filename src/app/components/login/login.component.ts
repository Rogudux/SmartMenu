import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  invalidCredentials = false;
  loading = false;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get correo() {
    return this.loginForm.get('correo');
  }

  get contraseña() {
    return this.loginForm.get('contraseña');
  }

  login() {
    this.submitted = true;
    this.invalidCredentials = false;
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { correo, contraseña } = this.loginForm.value;

    this.userService
      .getAllUsers()
      .pipe(take(1))
      .subscribe({
        next: (users) => {
          const match = users.find(u => u.correo === correo && u.contraseña === contraseña);
          this.loading = false;
          console.log('Router config:', this.router.config);
          if (match) {
            this.auth.setUser(match);
            // navegar explícito a la pestaña 'pedidos'
            this.router.navigateByUrl('/tabs').then(ok => console.log('Navegación a /tabs/pedidos:', ok));
          } else {
            this.invalidCredentials = true;
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al obtener users:', err);
          this.invalidCredentials = true;
        }
      });
  }
}
