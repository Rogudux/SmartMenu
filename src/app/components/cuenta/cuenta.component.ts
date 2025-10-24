import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonBadge, IonList, IonModal, IonSelect, IonSelectOption, IonHeader, IonToolbar,
  IonTitle, IonContent, IonButtons, IonToast, IonSkeletonText, IonSearchbar, IonToggle
} from '@ionic/angular/standalone';
import {
  ReactiveFormsModule, FormBuilder, Validators, FormGroup,
  AbstractControl, ValidatorFn, ValidationErrors
} from '@angular/forms';
import { Observable } from 'rxjs';

import { User } from '../../models/user';
import { Rol } from '../../models/rol';
import { AuthService } from '../../services/auth.service';
import { UserService, CreateUserDto, UpdateUserDto } from '../../services/user.service';
import { RolService } from '../../services/rol.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cuenta',
  standalone: true,
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonBadge, IonList, IonModal, IonSelect, IonSelectOption,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonToast,
    IonSkeletonText, IonSearchbar, IonToggle
  ],
})
export class CuentaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private usersSrv = inject(UserService);
  private rolesSrv = inject(RolService);
  private router = inject(Router);


  user$: Observable<User | null> = this.auth.currentUser$;

  me: User | null = null;
  roles: Rol[] = [];
  equipo: User[] = [];
  loadingEquipo = true;
  errorEquipo = false;

  // BUSCAR (equipo)
  query = '';

  // ====== Mi cuenta (edición condicional) ======
  meEditMode = false;          // ← alterna ver/editar
  changePassword = false;      // ← checkbox para cambiar contraseña
  meForm!: FormGroup;
  savingMe = false;

  // ====== Equipo (cruds) ======
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  userForm!: FormGroup; // (sin cambios fuertes; lo dejamos como estaba)
  // Toast
  toastMsg = '';
  showToast = false;

  ngOnInit(): void {
    this.buildMeForm();
    this.buildUserForm(); // por si sigues usando el CRUD de equipo

    // Cargar roles y equipo
    this.rolesSrv.getAllRoles().subscribe({
      next: (r) => (this.roles = r ?? []),
      error: () => (this.roles = []),
    });
    this.loadEquipo();

    // Prellenar "Mi cuenta"
    this.user$.subscribe(u => {
      this.me = u;
      if (u) {
        this.meForm.patchValue({
          nombre: u.nombre || '',
          correo: u.correo || '',
          currentPassword: '',
          newPassword: '',
          newPassword2: ''
        });
        this.changePassword = false;
        this.toggleChangePasswordValidators(false);
      }
    });
  }

  onLogout() {
  // Limpia sesión y navega al login
  this.auth.clear();
  this.router.navigate(['/login']);
}

  // ---------- Builders y Validadores ----------
  private buildMeForm() {
    this.meForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
      currentPassword: ['', [Validators.required, Validators.minLength(4)]], // SIEMPRE requerida al guardar
      newPassword: [''],
      newPassword2: [''],
    }, { validators: this.passwordsMatch('newPassword', 'newPassword2') });
  }

  private buildUserForm() {
    // Si todavía manejas el CRUD del equipo desde aquí, lo dejamos funcional.
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
      idRol: [null, [Validators.required]],
      currentPassword: [''],
      newPassword: [''],
      newPassword2: [''],
    }, { validators: this.passwordsMatch('newPassword', 'newPassword2') });
  }

  private passwordsMatch(p1: string, p2: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const a = group.get(p1)?.value ?? '';
      const b = group.get(p2)?.value ?? '';
      return a === b ? null : { passwordMismatch: true };
    };
  }

  private toggleChangePasswordValidators(enabled: boolean) {
    const np = this.meForm.get('newPassword');
    const np2 = this.meForm.get('newPassword2');
    if (!np || !np2) return;

    if (enabled) {
      np.setValidators([Validators.required, Validators.minLength(4)]);
      np2.setValidators([Validators.required, Validators.minLength(4)]);
    } else {
      np.clearValidators();
      np2.clearValidators();
      this.meForm.patchValue({ newPassword: '', newPassword2: '' });
    }
    np.updateValueAndValidity();
    np2.updateValueAndValidity();
  }

  // ---------- Helpers de rol (equipo) ----------
  private norm(s = ''): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  private resolveRolId(val: number | string | null | undefined): number | null {
    if (val == null) return null;
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    const name = this.norm(String(val));
    const found = this.roles.find(r => this.norm(r.nombre) === name);
    return found ? found.id : null;
  }
  rolNombre(idRol: number): string {
    return this.roles.find(r => r.id === idRol)?.nombre ?? '—';
  }

  // ---------- Equipo ----------
  loadEquipo() {
    this.loadingEquipo = true; this.errorEquipo = false;
    this.usersSrv.getAllUsers().subscribe({
      next: (users) => {
        this.equipo = (users ?? []).sort((a,b) => a.nombre.localeCompare(b.nombre));
        this.loadingEquipo = false;
      },
      error: () => { this.errorEquipo = true; this.loadingEquipo = false; }
    });
  }
  reloadEquipo() { this.loadEquipo(); }

  onSearch(q: string) { this.query = (q || '').trim().toLowerCase(); }
  get equipoFiltrado(): User[] {
    if (!this.query) return this.equipo;
    const q = this.query;
    return this.equipo.filter(u =>
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.correo || '').toLowerCase().includes(q) ||
      (u.nombreRol || '').toLowerCase().includes(q)
    );
  }

  // ========== Mi cuenta ==========
  entrarEditarMe() {
    this.meEditMode = true;
    this.changePassword = false;
    this.toggleChangePasswordValidators(false);
    this.meForm.markAsPristine();
    this.meForm.markAsUntouched();
  }

  cancelarEditarMe() {
    if (!this.me) return;
    this.meEditMode = false;
    this.changePassword = false;
    this.toggleChangePasswordValidators(false);
    this.meForm.reset({
      nombre: this.me.nombre || '',
      correo: this.me.correo || '',
      currentPassword: '',
      newPassword: '',
      newPassword2: ''
    });
  }

  onToggleChangePassword(checked: boolean) {
    this.changePassword = checked;
    this.toggleChangePasswordValidators(checked);
  }

  guardarMe() {
    if (!this.me || this.meForm.invalid) return;

    const nombre = this.meForm.value.nombre as string;
    const correo = this.meForm.value.correo as string;
    const currentPassword = (this.meForm.value.currentPassword as string || '').trim();
    const newPassword = (this.meForm.value.newPassword as string || '').trim();

    // Si NO cambia contraseña, enviamos la actual para “desbloquear” el update del backend.
    const passwordToSend = this.changePassword ? newPassword : currentPassword;

    const body: UpdateUserDto = {
      nombre,
      correo,
      idRol: this.me.idRol,
      contraseña: passwordToSend,
    };

    this.savingMe = true;
    this.usersSrv.updateUser(this.me.id, body).subscribe({
      next: (upd) => {
        this.auth.setUser(upd);
        // refleja en equipo también
        const idx = this.equipo.findIndex(x => x.id === upd.id);
        if (idx > -1) this.equipo[idx] = upd;
        this.equipo = [...this.equipo].sort((a,b)=>a.nombre.localeCompare(b.nombre));

        this.toast(this.changePassword ? 'Perfil y contraseña actualizados' : 'Perfil actualizado');
        this.savingMe = false;
        this.meEditMode = false;
        this.meForm.patchValue({ currentPassword: '', newPassword: '', newPassword2: '' });
      },
      error: () => {
        this.toast('No se pudo actualizar tu perfil');
        this.savingMe = false;
      }
    });
  }

  // ========== CRUD Equipo (sin cambios de UX pedidos) ==========
  abrirNuevo() {
    this.isEditing = false;
    this.editingId = null;
    this.userForm.reset({
      nombre: '',
      correo: '',
      idRol: this.roles[0]?.id ?? null,
      currentPassword: '',
      newPassword: '',
      newPassword2: ''
    });
    this.showModal = true;
  }

  abrirEditar(u: User) {
    this.isEditing = true;
    this.editingId = u.id;
    this.userForm.reset({
      nombre: u.nombre ?? '',
      correo: u.correo ?? '',
      idRol: u.idRol ?? null,
      currentPassword: '',
      newPassword: '',
      newPassword2: ''
    });
    this.showModal = true;
  }

  cerrarModal() { this.showModal = false; }

  guardarUser() {
    if (this.userForm.invalid) return;

    const nombre = this.userForm.value.nombre as string;
    const correo = this.userForm.value.correo as string;
    const idRol = this.resolveRolId(this.userForm.value.idRol) ?? null;
    if (idRol == null) { this.toast('Rol inválido'); return; }

    const newPassword = (this.userForm.value.newPassword as string || '').trim();

    if (this.isEditing && this.editingId != null) {
      const body: UpdateUserDto = { nombre, correo, idRol, contraseña: newPassword || 'x123' };
      this.usersSrv.updateUser(this.editingId, body).subscribe({
        next: (upd) => {
          const idx = this.equipo.findIndex(x => x.id === upd.id);
          if (idx > -1) this.equipo[idx] = upd;
          this.equipo = [...this.equipo].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Usuario actualizado');
          this.cerrarModal();
        },
        error: (e) => { console.error(e); this.toast('No se pudo actualizar'); },
      });
    } else {
      if (!newPassword) { this.toast('La contraseña es requerida'); return; }
      const body: CreateUserDto = { nombre, correo, contraseña: newPassword, idRol };
      this.usersSrv.createUser(body).subscribe({
        next: (created) => {
          this.equipo = [...this.equipo, created].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Usuario creado');
          this.cerrarModal();
        },
        error: (e) => { console.error(e); this.toast('No se pudo crear'); },
      });
    }
  }

  eliminarUser(u: User) {
    if (!confirm(`¿Eliminar a "${u.nombre}"?`)) return;
    this.usersSrv.deleteUser(u.id).subscribe({
      next: () => {
        this.equipo = this.equipo.filter(x => x.id !== u.id);
        if (this.me?.id === u.id) this.auth.clear();
        this.toast('Usuario eliminado');
      },
      error: () => this.toast('No se pudo eliminar'),
    });
  }

  // ---------- Toast ----------
  private toast(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 1600);
  }

  trackById(_i: number, u: User) { return u.id; }

  
}
